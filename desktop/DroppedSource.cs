using System.IO;

namespace CoE5Workbench;

internal static class DroppedSource
{
    // Paths must come only from WebView2's native CoreWebView2File attachments, never JSON text.
    internal static object Open(IReadOnlyList<string> paths)
    {
        if(paths.Count!=1)throw new InvalidDataException("Drop exactly one .c5m or .c5se source. Multiple files are not merged or opened; drop them separately.");
        if(!Path.IsPathFullyQualified(paths[0]))throw new InvalidDataException("Drop a local file from Explorer, or use Open mod file.");
        string path=Path.GetFullPath(paths[0]);GameRuntime.SafePath(path);
        if(Directory.Exists(path))throw new InvalidDataException("Drop a source file, not a folder.");
        return LocalFiles.OpenSource(path); // Same UTF-8/BOM/NUL/size/extension checks as the file dialog.
    }
}
