use std::fs;
use std::path::Path;

use base64::Engine;
use sha2::{Digest, Sha256};

const EXECUTABLE_SCRIPT_TYPES: &[&str] =
    &["", "module", "text/javascript", "application/javascript"];

fn csp_hash(content: &str) -> String {
    format!(
        "'sha256-{}'",
        base64::engine::general_purpose::STANDARD.encode(Sha256::digest(content.as_bytes()))
    )
}

fn inline_hashes(html: &str) -> (Vec<String>, Vec<String>) {
    let doc = scraper::Html::parse_document(html);
    let scripts = scraper::Selector::parse("script:not([src])").expect("script selector");
    let styled = scraper::Selector::parse("[style]").expect("style selector");
    let mut script_hashes: Vec<String> = doc
        .select(&scripts)
        .filter(|s| {
            let ty = s
                .value()
                .attr("type")
                .unwrap_or("")
                .trim()
                .to_ascii_lowercase();
            EXECUTABLE_SCRIPT_TYPES.contains(&ty.as_str())
        })
        .map(|s| csp_hash(&s.text().collect::<String>()))
        .collect();
    let mut style_hashes: Vec<String> = doc
        .select(&styled)
        .filter_map(|e| e.value().attr("style"))
        .map(csp_hash)
        .collect();
    script_hashes.sort();
    script_hashes.dedup();
    style_hashes.sort();
    style_hashes.dedup();
    (script_hashes, style_hashes)
}

fn main() {
    let index = Path::new("ui/dist/index.html");
    println!("cargo:rerun-if-changed=ui/dist/index.html");
    if !index.exists() {
        fs::create_dir_all("ui/dist").expect("create ui/dist");
        fs::write(index, "<!doctype html>\n<html><body>peacock UI not built; run `npm run build` in ui/</body></html>\n")
            .expect("write placeholder ui/dist/index.html");
    }
    let html = fs::read_to_string(index).expect("read ui/dist/index.html");
    let (scripts, styles) = inline_hashes(&html);
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
            "pub const CSP_SCRIPT_HASHES: &[&str] = &[{}];\npub const CSP_STYLE_ATTR_HASHES: &[&str] = &[{}];\n",
            list(&scripts),
            list(&styles)
        ),
    )
    .expect("write csp_hashes.rs");
}
