"""Preserve reviewed coverage when rebuilding supplied-book data."""
import json
import re
from pathlib import Path


def prepare_manifest(filename, value, directory):
    if filename != "manifest.json":
        return value
    book_id = value.get("id", "")
    if not re.fullmatch(r"[a-z0-9][a-z0-9-]*", book_id):
        raise ValueError("Book output needs a valid registered book ID")
    directory = Path(directory)
    target = directory / "coverage.json"
    installed = Path(__file__).resolve().parent.parent / "dist" / "data" / "books" / book_id / "coverage.json"
    source = target if target.exists() else installed
    if not source.exists():
        raise ValueError(f"Review and create coverage.json for {book_id} before generating its manifest")
    coverage = json.loads(source.read_text(encoding="utf-8"))
    if coverage.get("schemaVersion") != 1:
        raise ValueError(f"Unsupported coverage inventory for {book_id}")
    directory.mkdir(parents=True, exist_ok=True)
    if not target.exists():
        target.write_text(source.read_text(encoding="utf-8"), encoding="utf-8")
    files = {**value["files"], "coverage": "coverage.json"}
    manifest_path = installed.parent / "manifest.json"
    if manifest_path.exists():
        previous = json.loads(manifest_path.read_text(encoding="utf-8"))
        # A creator-data rebuild must not withdraw separately reviewed search
        # material or reset a released pack to an older hard-coded version.
        if "referenceEntries" in previous["files"]:
            filename = previous["files"]["referenceEntries"]
            if Path(filename).name != filename:
                raise ValueError("Unsafe reference filename")
            raw = installed.parent / filename
            output = directory / filename
            if not output.exists():
                output.write_bytes(raw.read_bytes())
            files["referenceEntries"] = filename
        installed_version = tuple(map(int, previous["version"].split(".")))
        requested_version = tuple(map(int, value["version"].split(".")))
        if installed_version > requested_version:
            value = {**value, "version": previous["version"]}
    return {**value, "files": files}
