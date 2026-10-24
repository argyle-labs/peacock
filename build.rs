use std::fs;
use std::path::Path;

#[path = "src/csp_scan.rs"]
mod csp_scan;

fn main() {
    let index = Path::new("ui/dist/index.html");
    println!("cargo:rerun-if-changed=ui/dist/index.html");
    println!("cargo:rerun-if-changed=src/csp_scan.rs");
    println!("cargo:rerun-if-env-changed=CI");
    if !index.exists() {
        let release = std::env::var("PROFILE").is_ok_and(|p| p == "release");
        if release || std::env::var_os("CI").is_some() {
            panic!(
                "ui/dist/index.html missing; run `npm run build` in ui/ before a release or CI build"
            );
        }
        fs::create_dir_all("ui/dist").expect("create ui/dist");
        fs::write(index, "<!doctype html>\n<html><body>peacock UI not built; run `npm run build` in ui/</body></html>\n")
            .expect("write placeholder ui/dist/index.html");
    }
    let html = fs::read_to_string(index).expect("read ui/dist/index.html");
    let found = csp_scan::inline_hashes(&html);
    if found.executable_scripts > 0 && found.scripts.is_empty() {
        panic!("ui/dist/index.html has inline scripts but no CSP hashes were produced");
    }
    let list = |v: &[String]| {
        v.iter()
            .map(|h| format!("{h:?}"))
            .collect::<Vec<_>>()
            .join(", ")
    };
    let out = Path::new(&std::env::var("OUT_DIR").expect("OUT_DIR")).join("csp_hashes.rs");
    fs::write(
        out,
        format!(
            "pub const CSP_SCRIPT_HASHES: &[&str] = &[{}];\npub const CSP_STYLE_HASHES: &[&str] = &[{}];\npub const CSP_STYLE_ATTR_HASHES: &[&str] = &[{}];\n",
            list(&found.scripts),
            list(&found.styles),
            list(&found.style_attrs)
        ),
    )
    .expect("write csp_hashes.rs");
}
