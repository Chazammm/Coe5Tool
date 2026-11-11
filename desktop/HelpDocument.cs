using System.Text.RegularExpressions;
using System.Windows;
using System.Windows.Documents;
using System.Windows.Media;

namespace CoE5Workbench;

// A local, selectable reading view. Links remain visible text: no remote content
// is loaded and no file, command or browser is launched from document markup.
internal static class HelpDocument
{
    internal static FlowDocument Read(string text)
    {
        var doc = new FlowDocument { FontFamily = new FontFamily("Segoe UI"), FontSize = 15, PagePadding = new Thickness(28), Background = new SolidColorBrush(Color.FromRgb(247, 244, 233)), Foreground = new SolidColorBrush(Color.FromRgb(35, 51, 44)) };
        bool code = false;
        foreach (string raw in text.Replace("\r", "").Split('\n'))
        {
            if (raw.StartsWith("```")) { code = !code; continue; }
            string line = code ? raw : raw.Trim(); if (line.Length == 0) continue;
            int level = !code && line.StartsWith('#') ? line.TakeWhile(c => c == '#').Count() : 0;
            if (level > 0) line = line[level..].Trim();
            if (!code) line = Regex.Replace(line, @"\[([^\]]+)\]\(([^)]+)\)", "$1").Replace("**", "").Replace("`", "");
            var paragraph = new Paragraph(new Run(line)) { Margin = new Thickness(0, level > 0 ? 18 : 5, 0, 7), LineHeight = 23 };
            if (level > 0) { paragraph.FontSize = level == 1 ? 26 : 20; paragraph.FontFamily = new FontFamily("Georgia"); paragraph.FontWeight = FontWeights.Bold; }
            if (code) { paragraph.FontFamily = new FontFamily("Consolas"); paragraph.FontSize = 13; }
            doc.Blocks.Add(paragraph);
        }
        return doc;
    }
}
