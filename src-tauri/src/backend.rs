use serde::{Deserialize, Serialize};
use sha2::{Digest, Sha256};
use std::{fs, path::{Path, PathBuf}, time::Duration};

#[derive(Debug, Deserialize)]
struct HostRecord {
    role: String,
    pid: u32,
    host: String,
    port: u16,
    #[serde(rename = "protocolVersion")]
    protocol_version: u32,
    #[serde(rename = "tokenFingerprint")]
    token_fingerprint: String,
}

#[derive(Debug, Deserialize)]
struct HostIdentity {
    pid: u32,
    role: String,
    #[serde(rename = "protocolVersion")]
    protocol_version: u32,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Attachment {
    pub role: String,
    pub pid: u32,
    pub host: String,
    pub port: u16,
    pub token: String,
}

fn lock_dir() -> Result<PathBuf, String> {
    if let Some(path) = std::env::var_os("HERMES_GATEWAY_LOCK_DIR") {
        let path = PathBuf::from(path);
        if path.is_absolute() { return Ok(path); }
        return Err("HERMES_GATEWAY_LOCK_DIR must be absolute".into());
    }
    if let Some(path) = std::env::var_os("XDG_STATE_HOME") {
        let path = PathBuf::from(path);
        if path.is_absolute() { return Ok(path.join("hermes/gateway-locks")); }
    }
    dirs::home_dir()
        .map(|p| p.join(".local/state/hermes/gateway-locks"))
        .ok_or_else(|| "Cannot locate the user home directory".into())
}

#[cfg(unix)]
fn owned_by_current_user(path: &Path) -> bool {
    use std::os::unix::fs::MetadataExt;
    fs::metadata(path).map(|m| m.uid() == unsafe { libc_getuid() }).unwrap_or(false)
}

#[cfg(unix)]
unsafe fn libc_getuid() -> u32 {
    extern "C" { fn getuid() -> u32; }
    unsafe { getuid() }
}

#[cfg(not(unix))]
fn owned_by_current_user(path: &Path) -> bool { path.exists() }

#[cfg(unix)]
fn owner_only(path: &Path) -> bool {
    use std::os::unix::fs::PermissionsExt;
    fs::metadata(path).map(|m| m.permissions().mode() & 0o077 == 0).unwrap_or(false)
}

#[cfg(not(unix))]
fn owner_only(path: &Path) -> bool { path.exists() }

fn dial_host(host: &str) -> Result<String, String> {
    match host {
        "127.0.0.1" | "localhost" | "::1" => Ok(host.to_string()),
        "0.0.0.0" | "::" => Ok("127.0.0.1".into()),
        _ => Err(format!("Refusing non-loopback backend host: {host}")),
    }
}

fn try_record(dir: &Path, role: &str) -> Result<Option<Attachment>, String> {
    let record_path = dir.join(format!("host-{role}.json"));
    if !record_path.exists() { return Ok(None); }
    let token_path = dir.join(format!("host-{role}.token"));
    if !owned_by_current_user(&record_path) || !owned_by_current_user(&token_path) {
        return Err(format!("{role}: rendezvous files are not owned by this user"));
    }
    if !owner_only(&token_path) { return Err(format!("{role}: token file is not owner-only")); }

    let record: HostRecord = serde_json::from_slice(&fs::read(&record_path).map_err(|e| e.to_string())?)
        .map_err(|e| format!("{role}: invalid host record: {e}"))?;
    if record.protocol_version != 1 || record.role != role {
        return Err(format!("{role}: incompatible host record"));
    }
    let token = fs::read_to_string(&token_path).map_err(|e| e.to_string())?.trim().to_string();
    if token.is_empty() { return Err(format!("{role}: empty token")); }
    let fingerprint = hex_prefix(&token);
    if fingerprint != record.token_fingerprint {
        return Err(format!("{role}: token fingerprint mismatch"));
    }
    let host = dial_host(&record.host)?;
    let identity_url = format!("http://{}:{}/api/host/identity", format_host(&host), record.port);
    let response = ureq::get(&identity_url)
        .timeout(Duration::from_secs(2))
        .set("X-Hermes-Token", &token)
        .set("Authorization", &format!("Bearer {token}"))
        .call()
        .map_err(|_| format!("{role}: backend identity probe failed"))?;
    let identity: HostIdentity = response.into_json().map_err(|_| format!("{role}: invalid identity response"))?;
    if identity.protocol_version != 1 || identity.pid != record.pid || identity.role != record.role {
        return Err(format!("{role}: identity does not match the host record"));
    }
    Ok(Some(Attachment { role: role.into(), pid: record.pid, host, port: record.port, token }))
}

fn format_host(host: &str) -> String {
    if host.contains(':') { format!("[{host}]") } else { host.into() }
}

fn hex_prefix(token: &str) -> String {
    Sha256::digest(token.as_bytes())[..8].iter().map(|b| format!("{b:02x}")).collect()
}

#[tauri::command]
pub fn discover_backend() -> Result<Attachment, String> {
    let dir = lock_dir()?;
    let mut failures = Vec::new();
    for role in ["serve", "desktop-serve"] {
        match try_record(&dir, role) {
            Ok(Some(attachment)) => return Ok(attachment),
            Ok(None) => {}
            Err(error) => failures.push(error),
        }
    }
    Err(if failures.is_empty() {
        "No running Hermes backend found. Start `hermes serve` and try again.".into()
    } else {
        format!("No usable Hermes backend found: {}", failures.join("; "))
    })
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn loopback_only() {
        assert_eq!(dial_host("0.0.0.0").unwrap(), "127.0.0.1");
        assert!(dial_host("192.168.1.2").is_err());
        assert!(dial_host("example.com").is_err());
    }

    #[test]
    fn fingerprint_matches_hermes_format() {
        assert_eq!(hex_prefix("test-token"), "4c5dc9b7708905f7");
    }

    #[test]
    fn ipv6_http_host_is_bracketed() {
        assert_eq!(format_host("::1"), "[::1]");
        assert_eq!(format_host("127.0.0.1"), "127.0.0.1");
    }
}
