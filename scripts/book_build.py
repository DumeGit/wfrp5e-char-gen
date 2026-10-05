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
    return {**value, "files": {**value["files"], "coverage": "coverage.json"}}
