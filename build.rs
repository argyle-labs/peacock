use std::fs;
use std::path::Path;

fn main() {
    let index = Path::new("ui/dist/index.html");
    println!("cargo:rerun-if-changed=ui/dist/index.html");
    if !index.exists() {
        fs::create_dir_all("ui/dist").expect("create ui/dist");
        fs::write(index, "<!doctype html>\n<html><body>peacock UI not built; run `npm run build` in ui/</body></html>\n")
            .expect("write placeholder ui/dist/index.html");
    }
}
