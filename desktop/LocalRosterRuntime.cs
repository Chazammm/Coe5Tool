using System.IO;
namespace CoE5Workbench;
internal static class LocalRosterRuntime
{
    internal const string Label="CoE5SE 2.13.0 + Workbench roster-v1 (local)";
    internal const string PluginKey="profile/mods/CoE5SE/coe5se.c5plugin.dll";
    internal const string PluginSha256="46c982fcef57c60fa68a6fcbcc624b6ce2e78d36526991508c8d4d5ff4826ec7";
    internal static bool Available(){
        try{string path=Path.Combine(AppContext.BaseDirectory,"roster-runtime","coe5se.c5plugin.dll");GameRuntime.SafePath(path);return File.Exists(path)&&GameRuntime.Hash(path)==PluginSha256;}
        catch(IOException){return false;}
    }
    internal static Dictionary<string,string> Expected(bool mixed, string version="2.13.0") {
        if(mixed && version!="2.13.0")throw new InvalidDataException("Mixed targets require the separately verified 2.13.0 roster-v1 runtime. Its API-10 plugin cannot be loaded with the 3.2.2 API-11 loader. Use one type, or prepare a new 2.13.0 mixed test.");
        var files=new Dictionary<string,string>(GameRuntime.FilesFor(version));
        if(mixed)files[PluginKey]=PluginSha256;
        return files;
    }
    internal static RuntimeIdentity Overlay(RuntimeIdentity verified) {
        _=Expected(true,verified.ExtenderVersion);
        string path=Path.Combine(AppContext.BaseDirectory,"roster-runtime","coe5se.c5plugin.dll");
        GameRuntime.SafePath(path);
        if(!File.Exists(path)||GameRuntime.Hash(path)!=PluginSha256)throw new InvalidDataException("The private 2.13.0 roster-v1 component is unavailable. It is not distributed with Workbench. Use one native type, or retain your separately authorized legacy setup. No component is downloaded or substituted.");
        var sources=new Dictionary<string,string>(verified.Sources){[PluginKey]=path};
        return verified with {Sources=sources};
    }
}
