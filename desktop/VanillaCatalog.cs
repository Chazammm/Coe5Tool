using System.Buffers.Binary;
using System.Globalization;
using System.IO;
using System.Text;

namespace CoE5Workbench;

// Read-only metadata from the exact Windows 5.43 executable; never a complete source-definition exporter.
internal static class VanillaCatalog
{
    internal const string Fingerprint = "489d0b82fa790ec36e69a23e2335d0c2048fa57f4051fe8159c64f2d33508e55";
    internal sealed record TargetRow(int id, string name, int hp);
    internal static object Read(string path) => Decode(ReadPinned(path));
    internal static TargetRow[] ReadTargets(string path) => (TargetRow[])Decode(ReadPinned(path), true);
    private static byte[] ReadPinned(string path)
    {
        GameRuntime.SafePath(Path.GetFullPath(path));
        using var stream=new FileStream(path,FileMode.Open,FileAccess.Read,FileShare.Read);
        if(stream.Length>256*1024*1024)throw new InvalidDataException("Executable exceeds the catalog reader limit.");
        byte[] bytes=new byte[checked((int)stream.Length)];stream.ReadExactly(bytes);
        if(Convert.ToHexString(System.Security.Cryptography.SHA256.HashData(bytes)).ToLowerInvariant()!=Fingerprint)throw new InvalidDataException("The offline catalog supports only the verified Windows CoE5 5.43 executable. No offsets are guessed for another build.");
        return bytes;
    }
    internal static object Decode(byte[] bytes, bool targetsOnly=false)
    {
        uint U32(int at)=>BinaryPrimitives.ReadUInt32LittleEndian(bytes.AsSpan(at,4));
        ulong U64(int at)=>BinaryPrimitives.ReadUInt64LittleEndian(bytes.AsSpan(at,8));
        int I32(int at)=>unchecked((int)U32(at));
        ushort U16(int at)=>BinaryPrimitives.ReadUInt16LittleEndian(bytes.AsSpan(at,2));
        if(bytes.Length<256 || U16(0)!=0x5a4d)throw new InvalidDataException("Not a PE image.");
        int pe=checked((int)U32(0x3c));
        if(pe<0 || pe>bytes.Length-256 || U32(pe)!=0x4550 || U16(pe+4)!=0x8664 || U16(pe+24)!=0x20b)throw new InvalidDataException("Expected a Windows x64 PE image.");
        int count=U16(pe+6),table=pe+24+U16(pe+20);ulong imageBase=U64(pe+48);
        if(count<1 || count>96 || table<0 || table+count*40>bytes.Length)throw new InvalidDataException("Invalid PE sections.");
        int At(ulong rva,int size)
        {
            for(int i=0;i<count;i++){
                int section=table+i*40;ulong va=U32(section+12),raw=U32(section+16),offset=U32(section+20);
                if(rva>=va && rva-va<=raw && (ulong)size<=raw-(rva-va)){
                    ulong result=offset+rva-va;if(result+(ulong)size>(ulong)bytes.Length)break;return checked((int)result);
                }
            }
            throw new InvalidDataException("Table/pointer is not backed by executable bytes.");
        }
        string Name(int at,int limit)
        {
            int end=Array.IndexOf(bytes,(byte)0,at,Math.Min(limit,bytes.Length-at));
            if(end<0)throw new InvalidDataException("Unterminated game name.");
            return new UTF8Encoding(false,true).GetString(bytes,at,end-at);
        }
        string Pointed(ulong pointer)=>pointer==0?"":pointer<imageBase?throw new InvalidDataException("Invalid name pointer."):Name(At(pointer-imageBase,1),256);
        string Num(long value)=>value.ToString(CultureInfo.InvariantCulture);
        if(targetsOnly){
            var targets=new List<TargetRow>();
            for(int id=0;id<2000;id++){
                int at=At(0x1c65280UL+(ulong)id*0x9d8,0x9d8);
                if(bytes[at]==0)continue;
                string name=Name(at,50);
                int hp=BinaryPrimitives.ReadInt16LittleEndian(bytes.AsSpan(at+0x36,2));
                if(hp>0 && NativeTarget.Accepts(id,name))targets.Add(new(id,name,hp));
            }
            return targets.ToArray();
        }
        var rows=new List<object>();var weaponIds=new HashSet<int>();
        for(int id=0;id<1200;id++){
            int at=At(0x5700790UL+(ulong)id*0xa0,0xa0);string name=Name(at,64);if(name=="")continue;
            var fields=new Dictionary<string,string>();
            foreach(var f in new[]{("trgrank",0x40),("range",0x44),("init",0x48),("dmgtype",0x4c),("aoe",0x58),("flymode",0x68),("flylook",0x6c),("flysound",0x70),("look",0x74),("sound",0x78),("nextalwayswep",0x90)})fields[f.Item1]=Num(I32(at+f.Item2));
            fields["dmg"]=U64(at+0x50).ToString(CultureInfo.InvariantCulture);fields["flagsRaw"]=U64(at+0x60).ToString(CultureInfo.InvariantCulture);fields["nextdmg"]=U64(at+0x98).ToString(CultureInfo.InvariantCulture);
            rows.Add(new{type="weapon",id,name,fields});weaponIds.Add(id);
        }
        for(int id=0;id<1029;id++){
            int at=At(0x569f590UL+(ulong)id*0x28,0x28);string name=Pointed(U64(at));int weapon=I32(at+16);
            if(name=="" || !weaponIds.Contains(weapon) || I32(at+8)<0)throw new InvalidDataException("Unexpected native spell table or weapon link.");
            var fields=new Dictionary<string,string>{{"path",Num(I32(at+8))},{"level",Num(I32(at+12))},{"weapon",Num(weapon)},{"weaponDamage",Num(unchecked((long)U64(at+24)))},{"flagsRaw",U64(at+32).ToString(CultureInfo.InvariantCulture)}};
            rows.Add(new{type="spell",id,name,fields});
        }
        return new{schema="wb-installed-543",gameSha256=Fingerprint,version="CoE5 5.43 Windows · pristine executable",source="Your verified local CoE5.exe; excludes loaded mods",completeNames=true,completeDefinitions=false,spellSlots=1029,weaponSlots=1200,entries=rows};
    }
}
