using System.IO;
using System.Text.Json;
using System.Runtime.InteropServices;

namespace CoE5Workbench;

internal static class OriginalSelfTest
{
    [UnmanagedFunctionPointer(CallingConvention.Cdecl)] private delegate int LuaRun([MarshalAs(UnmanagedType.LPUTF8Str)] string source);
    [UnmanagedFunctionPointer(CallingConvention.Cdecl)] private delegate IntPtr LuaError();
    internal static void Run(string report,Action<string,Action> check)
    {
        string folder=Path.GetDirectoryName(Path.GetFullPath(report))!;
        void Require(bool v){if(!v)throw new Exception("Assertion failed");}
        void Refused(Action action){try{action();}catch{return;}throw new Exception("Expected refusal");}
        string input=Path.Combine(folder,"installed-catalog-input.json");
        if(File.Exists(input))check("Verified local 5.43 catalog: 1029 spells, 936 named native weapons; duplicates and metadata, no game writes",()=>{
            using var doc=JsonDocument.Parse(File.ReadAllText(input));string path=doc.RootElement.GetProperty("path").GetString()!,before=GameRuntime.Hash(path);
            var catalog=JsonSerializer.SerializeToElement(VanillaCatalog.Read(path));var rows=catalog.GetProperty("entries").EnumerateArray().ToArray();
            Require(rows.Count(x=>x.GetProperty("type").GetString()=="spell")==1029 && rows.Count(x=>x.GetProperty("type").GetString()=="weapon")==936);
            Require(rows.Count(x=>x.GetProperty("name").GetString()=="Banish" && x.GetProperty("type").GetString()=="spell")>1);
            Require(catalog.GetProperty("completeNames").GetBoolean()&&!catalog.GetProperty("completeDefinitions").GetBoolean());
            Require(before==GameRuntime.Hash(path));File.WriteAllText(Path.Combine(folder,"installed-catalog-packet.json"),catalog.GetRawText());
        });
        check("Static catalog refuses unsupported fingerprints and malformed PE bounds",()=>{
            string bad=Path.Combine(folder,"unverified-CoE5.exe");File.WriteAllBytes(bad,new byte[300]);Refused(()=>VanillaCatalog.Read(bad));
            Refused(()=>VanillaCatalog.Decode(new byte[20]));var bytes=new byte[512];bytes[0]=0x4d;bytes[1]=0x5a;BitConverter.GetBytes(uint.MaxValue).CopyTo(bytes,0x3c);Refused(()=>VanillaCatalog.Decode(bytes));
        });
        string luaInput=Path.Combine(folder,"original-lua-cases.json");
        if(File.Exists(luaInput)){
            using var doc=JsonDocument.Parse(File.ReadAllText(luaInput));var data=doc.RootElement;
            string dll=data.GetProperty("dll").GetString()!;Require(GameRuntime.Hash(dll)==data.GetProperty("sha256").GetString());
            IntPtr handle=NativeLibrary.Load(dll);
            try{
                var run=Marshal.GetDelegateForFunctionPointer<LuaRun>(NativeLibrary.GetExport(handle,"luaTestRun"));var error=Marshal.GetDelegateForFunctionPointer<LuaError>(NativeLibrary.GetExport(handle,"luaTestError"));
                foreach(var c in data.GetProperty("cases").EnumerateArray())check("Mock Lua original observation: "+c.GetProperty("name").GetString(),()=>{if(run(c.GetProperty("source").GetString()!)!=0)throw new Exception(Marshal.PtrToStringUTF8(error()));});
            }finally{NativeLibrary.Free(handle);}
        }
    }
}
