using System.IO;
namespace CoE5Workbench;
internal static class LocalRosterRuntime
{
    internal const string Label="CoE5SE 2.13.0 + Workbench roster-v1 (local)";
    internal const string PluginKey="profile/mods/CoE5SE/coe5se.c5plugin.dll";
    internal const string PluginSha256="46c982fcef57c60fa68a6fcbcc624b6ce2e78d36526991508c8d4d5ff4826ec7";
    internal static Dictionary<string,string> Expected(bool mixed) {
        var files=new Dictionary<string,string>(GameRuntime.KnownFiles);
        if(mixed)files[PluginKey]=PluginSha256;
        return files;
    }
    internal static RuntimeIdentity Overlay(RuntimeIdentity verified) {
        string path=Path.Combine(AppContext.BaseDirectory,"roster-runtime","coe5se.c5plugin.dll");
        GameRuntime.SafePath(path);
        if(!File.Exists(path)||GameRuntime.Hash(path)!=PluginSha256)throw new InvalidDataException("The pinned local roster-v1 plugin is missing. Rebuild the local Workbench, or use one native type with released CoE5SE.");
        var sources=new Dictionary<string,string>(verified.Sources){[PluginKey]=path};
        return verified with {Sources=sources};
    }
}
