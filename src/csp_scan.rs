use base64::Engine;
use sha2::{Digest, Sha256};

const EXECUTABLE_SCRIPT_TYPES: &[&str] =
    &["", "module", "text/javascript", "application/javascript"];

#[derive(Debug, Default, PartialEq, Eq)]
pub struct InlineHashes {
    pub executable_scripts: usize,
    pub scripts: Vec<String>,
    pub styles: Vec<String>,
    pub style_attrs: Vec<String>,
}

fn csp_hash(content: &str) -> String {
    format!(
        "'sha256-{}'",
        base64::engine::general_purpose::STANDARD.encode(Sha256::digest(content.as_bytes()))
    )
}

fn sorted(mut v: Vec<String>) -> Vec<String> {
    v.sort();
    v.dedup();
    v
}

pub fn inline_hashes(html: &str) -> InlineHashes {
    let doc = scraper::Html::parse_document(html);
    let sel = |s: &str| scraper::Selector::parse(s).expect("valid selector");
    let executable: Vec<String> = doc
        .select(&sel("script:not([src])"))
        .filter(|s| {
            let ty = s
                .value()
                .attr("type")
                .unwrap_or("")
                .trim()
                .to_ascii_lowercase();
            EXECUTABLE_SCRIPT_TYPES.contains(&ty.as_str())
        })
        .map(|s| s.text().collect::<String>())
        .collect();
    InlineHashes {
        executable_scripts: executable.len(),
        scripts: sorted(executable.iter().map(|s| csp_hash(s)).collect()),
        styles: sorted(
            doc.select(&sel("style"))
                .map(|s| csp_hash(&s.text().collect::<String>()))
                .collect(),
        ),
        style_attrs: sorted(
            doc.select(&sel("[style]"))
                .filter_map(|e| e.value().attr("style"))
                .map(csp_hash)
                .collect(),
        ),
    }
}
