using System.IO;
using System.Text.Json;
using System.IO.Compression;

namespace CoE5Workbench;

internal static class SelfTest
{
    internal static int Run(string reportFile)
    {
        var checks = new List<object>(); string folder = Path.Combine(Path.GetDirectoryName(Path.GetFullPath(reportFile))!, "desktop-test-fixtures");
        Directory.CreateDirectory(folder);
        void Check(string name, Action test) { try { test(); checks.Add(new { name, pass = true }); } catch (Exception e) { checks.Add(new { name, pass = false, error = e.Message }); } }
        void Require(bool value) { if (!value) throw new Exception("Assertion failed"); }
        void Refused(Action action) { bool threw = false; try { action(); } catch { threw = true; } Require(threw); }
        string source = "\uFEFF# keep\r\nnewweapon \"W\"\nrange\t5 # comment\rdmg 8", input = Path.Combine(folder, "original.c5m"), copy = Path.Combine(folder, Guid.NewGuid() + ".edited.c5m");
        File.WriteAllText(input, source, LocalFiles.Utf8);
        Check("Read-only source import retains BOM and mixed EOL", () => { LocalFiles.OpenSource(input); Require(LocalFiles.ReadText(input, 1000) == source); });
        Check("CreateNew export retains exact UTF-8 and leaves original", () => { LocalFiles.ExportNew(copy, source.Replace("range\t5", "range\t9")); Require(File.ReadAllBytes(copy).SequenceEqual(LocalFiles.Utf8.GetBytes(source.Replace("range\t5", "range\t9")))); Require(LocalFiles.ReadText(input, 1000) == source); });
        Check("Original and existing copies cannot be overwritten", () => { Refused(() => LocalFiles.ExportNew(input, "changed")); Refused(() => LocalFiles.ExportNew(copy, "changed")); Require(LocalFiles.ReadText(input, 1000) == source); });
        Check("Dropped sources reuse native encoding/preservation rules and reject multiple files, folders, relative paths and unsupported sources",()=>{
            var result=JsonSerializer.SerializeToElement(DroppedSource.Open(new[]{input}));Require(result.GetProperty("text").GetString()==source && result.GetProperty("mode").GetString()=="c5m");
            string sidecar=Path.Combine(folder,"dropped.c5se");File.WriteAllText(sidecar,source,LocalFiles.Utf8);Require(JsonSerializer.SerializeToElement(DroppedSource.Open(new[]{sidecar})).GetProperty("mode").GetString()=="c5se");
            Refused(()=>DroppedSource.Open(Array.Empty<string>()));Refused(()=>DroppedSource.Open(new[]{input,sidecar}));Refused(()=>DroppedSource.Open(new[]{folder}));Refused(()=>DroppedSource.Open(new[]{"relative.c5m"}));
            string bad=Path.Combine(folder,"dropped.txt");File.WriteAllText(bad,"keep");Refused(()=>DroppedSource.Open(new[]{bad}));
            bad=Path.Combine(folder,"dropped-invalid.c5m");File.WriteAllBytes(bad,new byte[]{255,255});Refused(()=>DroppedSource.Open(new[]{bad}));File.WriteAllText(bad,"\0");Refused(()=>DroppedSource.Open(new[]{bad}));File.WriteAllText(bad,new string('x',2*1024*1024+1));Refused(()=>DroppedSource.Open(new[]{bad}));
            Require(LocalFiles.ReadText(input,1000)==source);
        });
        Check("UTF-16, invalid UTF-8, NUL, size and extension refused", () => { Refused(() => LocalFiles.ReadText(input, 2)); Refused(() => LocalFiles.ExportNew(Path.Combine(folder, "bad.txt"), "x")); Refused(() => LocalFiles.ExportNew(Path.Combine(folder, "bad.c5m"), "\0")); var bad = Path.Combine(folder, "invalid.c5m"); File.WriteAllBytes(bad, [255, 255]); Refused(() => LocalFiles.OpenSource(bad)); });
        Check("Host origin, port, traversal and remote asset restrictions", () => { Require(HostPolicy.IsPage(HostPolicy.Origin + "/index.html")); foreach (string url in new[] { "file:///index.html", "https://evil.invalid/index.html", "https://workbench.invalid:444/index.html", "https://user@workbench.invalid/index.html", "https://workbench.invalid/other.html" }) Require(!HostPolicy.IsPage(url)); Require(HostPolicy.HelpFile(HostPolicy.Origin + "/docs/RESUMING-0161.md") == "docs/RESUMING-0161.md"); Require(HostPolicy.HelpFile(HostPolicy.Origin + "/docs/WINDOWS-PACKAGE-0161.md") == "docs/WINDOWS-PACKAGE-0161.md"); Require(HostPolicy.AssetAllowed(HostPolicy.Origin + "/prepared-sessions-ui.js")); Require(HostPolicy.AssetAllowed(HostPolicy.Origin + "/core.js")); Require(HostPolicy.AssetAllowed(HostPolicy.Origin + "/target.js")); Require(HostPolicy.AssetAllowed(HostPolicy.Origin + "/weapon-edit-fixture.js")); Require(!HostPolicy.AssetAllowed(HostPolicy.Origin + "/../private-data/names.json")); Require(!HostPolicy.AssetAllowed("https://example.com/x")); Require(HostPolicy.HelpFile("file:///README.md") == null); Require(HostPolicy.HelpFile(HostPolicy.Origin + "/docs/RECORD-DESK-06.md") == "docs/RECORD-DESK-06.md"); });
        Check("Unknown name index accepts strings without invented provenance", () => { var path = Path.Combine(folder, "index.json"); File.WriteAllText(path, "{\"spell\":[\"Test spell\"],\"weapon\":[\"Test weapon\"]}"); string packet = JsonSerializer.Serialize(LocalFiles.NamesPacket(path)); Require(!packet.Contains(LocalFiles.KnownNamesBlob)); File.WriteAllText(path, "{\"spell\":[0],\"weapon\":[]}"); Refused(() => LocalFiles.NamesPacket(path)); });
        Check("Unsupported metadata version/fingerprint cannot replace the private library", () => {
            string[] paths = new[] { "names.json", "data-files.json", "library-choice.json" }.Select(x => Path.Combine(LocalFiles.Profile, x)).ToArray();
            var before = paths.ToDictionary(x => x, x => File.Exists(x) ? Convert.ToBase64String(File.ReadAllBytes(x)) : null);
            string bad = Path.Combine(folder, "Spell Data v5.42.txt"); File.WriteAllText(bad, "newspell \"Unverified\" # 0\npath 3\nlevel 1\nweapon \"W\" # nbr 0.\ndmg 0\n");
            Refused(() => LocalFiles.ImportData([bad])); Refused(() => LocalFiles.ImportData([]));
            foreach (string p in paths) Require(before[p] == (File.Exists(p) ? Convert.ToBase64String(File.ReadAllBytes(p)) : null));
        });
        var packageFiles = new Dictionary<string, string> { ["WB_Check.c5m"] = "# separate test source\r\n", ["WB_Check.lua"] = "-- test only\n", ["README.txt"] = "not game-verified", ["manifest.json"] = "{}" };
        Check("Test ZIP contains matching paths, exact text and original 256x64 TGA", () => {
            using var zip = new ZipArchive(new MemoryStream(TestPackage.Build("WB_Check", packageFiles)), ZipArchiveMode.Read);
            Require(zip.Entries.Count == 5);
            foreach (var item in packageFiles) { using var reader = new StreamReader(zip.GetEntry("WB_Check/" + item.Key)!.Open()); Require(reader.ReadToEnd() == item.Value); }
            using var image = zip.GetEntry("WB_Check/banner.tga")!.Open(); using var memory = new MemoryStream(); image.CopyTo(memory); byte[] b = memory.ToArray();
            Require(b.Length == 18 + 256 * 64 * 3 && b[2] == 2 && b[12] == 0 && b[13] == 1 && b[14] == 64 && b[16] == 24);
        });
        Check("Test ZIP rejects unsafe identities, paths, incomplete and oversized contents", () => {
            foreach (string id in new[] { "../Bad", "A/B", "A\\B", "A\n", "CoE5SE", "CON", "NUL", "LPT1" }) Refused(() => TestPackage.Build(id, packageFiles));
            var bad = new Dictionary<string, string>(packageFiles) { ["../outside.lua"] = "bad" }; Refused(() => TestPackage.Build("WB_Check", bad));
            bad = new(packageFiles); bad.Remove("WB_Check.lua"); Refused(() => TestPackage.Build("WB_Check", bad));
            bad = new(packageFiles); bad["README.txt"] = new string('x', 128 * 1024 + 1); Refused(() => TestPackage.Build("WB_Check", bad));
        });
        Check("Test ZIP uses CreateNew and leaves existing destinations and source intact", () => {
            string target = Path.Combine(folder, Guid.NewGuid() + ".test.zip"); TestPackage.ExportNew(target, "WB_Check", packageFiles); byte[] before = File.ReadAllBytes(target);
            Refused(() => TestPackage.ExportNew(target, "WB_Check", packageFiles)); Require(before.SequenceEqual(File.ReadAllBytes(target)));
            Refused(() => TestPackage.ExportNew(input, "WB_Check", packageFiles)); Require(LocalFiles.ReadText(input, 1000) == source);
        });
        string packageInput = Path.Combine(Path.GetDirectoryName(Path.GetFullPath(reportFile))!, "creation-package-input.json");
        if (File.Exists(packageInput)) Check("Actual generated candidate packs through native ZIP writer (no game)", () => {
            using var doc = JsonDocument.Parse(File.ReadAllText(packageInput)); var body = doc.RootElement;
            string id = body.GetProperty("modId").GetString()!; var files = new Dictionary<string, string>();
            foreach (var file in body.GetProperty("files").EnumerateArray()) files.Add(file.GetProperty("name").GetString()!, file.GetProperty("text").GetString()!);
            // A unique local evidence copy; never overwrites a previous candidate or installs it.
            string target = Path.Combine(folder, "generated-" + Guid.NewGuid() + ".test.zip"); TestPackage.ExportNew(target, id, files);
            using var zip = ZipFile.OpenRead(target); Require(zip.GetEntry(id + "/" + id + ".lua") != null); Require(zip.GetEntry(id + "/banner.tga") != null);
        });
        Check("Recorded battle view and guide are packaged and allowed by the native host",()=>{
            Require(File.Exists(Path.Combine(AppContext.BaseDirectory,"ui","battle-results.js")));
            Require(File.Exists(Path.Combine(AppContext.BaseDirectory,"ui","docs","BATTLE-RESULTS-016.md")));
            Require(HostPolicy.AssetAllowed(HostPolicy.Origin+"/battle-results.js"));
            Require(HostPolicy.HelpFile(HostPolicy.Origin+"/docs/BATTLE-RESULTS-016.md")=="docs/BATTLE-RESULTS-016.md");
        });
        string? runtime = null;
        string monsterInput = Path.Combine(Path.GetDirectoryName(Path.GetFullPath(reportFile))!, "monster-reference-input.json");
        if(File.Exists(monsterInput)) Check("All 1851 explicit historical monster variants are fingerprint-checked without executing their pseudo commands",()=>{
            using var inputDoc=JsonDocument.Parse(File.ReadAllText(monsterInput));string path=inputDoc.RootElement.GetProperty("path").GetString()!;
            var packet=JsonSerializer.SerializeToElement(ChoiceStore.MonsterPacket(path));var rows=packet.GetProperty("entries").EnumerateArray().ToArray();Require(rows.Length==1851 && rows.Select(x=>x.GetProperty("id").GetInt32()).Distinct().Count()==1851 && rows.Select(x=>x.GetProperty("name").GetString()).Distinct().Count()==1589);
            string bad=Path.Combine(folder,"monster-unverified.c5m");File.WriteAllText(bad,"newmonster \"Fake\" # 0\n");Refused(()=>ChoiceStore.MonsterPacket(bad));
            File.WriteAllText(Path.Combine(Path.GetDirectoryName(Path.GetFullPath(reportFile))!,"offline-choice-packet.json"),JsonSerializer.Serialize(ChoiceStore.Packet()));
        });
        string evidence=Path.GetDirectoryName(Path.GetFullPath(reportFile))!;
        string catalogPath=Path.Combine(evidence,"catalog-path.txt");
        if(File.Exists(catalogPath))Check("Verified native target slots retain IDs, duplicate names and base HP",()=>{
            var rows=VanillaCatalog.ReadTargets(File.ReadAllText(catalogPath).Trim());
            Require(rows.Length==1847 && rows.Select(r=>r.id).Distinct().Count()==rows.Length);
            Require(rows.All(r=>r.hp>0 && NativeTarget.Accepts(r.id,r.name)));
            Require(rows.Single(r=>r.id==0).name=="Baron" && rows.Single(r=>r.id==13).name=="Spearman");
            Require(rows.Single(r=>r.id==487)==new VanillaCatalog.TargetRow(487,"Winter Wolf",13));
            Require(rows.Single(r=>r.id==609)==new VanillaCatalog.TargetRow(609,"Deer",6));
            Require(rows.Where(r=>r.name=="Captain").Select(r=>r.id).SequenceEqual(new[]{12,291}));
        });
        string mixedCandidate=Path.Combine(evidence,"mixed-candidate.json");
        if(File.Exists(mixedCandidate))Check("Real mixed roster observation preserves both native types and rejects changed identities",()=>{
            var c=TestCandidate.Read(JsonSerializer.Deserialize<JsonElement>(File.ReadAllText(mixedCandidate)));
            var s=JsonSerializer.Deserialize<IsolatedTests.Session>(File.ReadAllText(Path.Combine(evidence,"mixed-session.json")))!;
            Require(c.Roster is {Length:2} && c.Roster[0].id==609 && c.Roster[1].id==487 && !c.WeaponEditing);
            var local=Path.Combine(folder,"mixed-replay");Directory.CreateDirectory(TestExchange.Area(local,c.ModId));
            string ini=File.ReadAllText(Path.Combine(evidence,"mixed-result.ini"));
            string result=Path.Combine(TestExchange.Area(local,c.ModId),"wb-mixed-"+s.ResultRun+".ini");
            JsonElement Replay(string text){File.WriteAllText(result,text);return JsonSerializer.SerializeToElement(MixedResults.Read(local,s,c));}
            var packet=Replay(ini);Require(packet.GetProperty("units").GetArrayLength()==3 && packet.GetProperty("restored").GetBoolean());
            Require(packet.GetProperty("units")[2].GetProperty("monster").GetInt32()==487 && packet.GetProperty("units")[2].GetProperty("resistance").GetInt32()==100);
            foreach(string wrong in new[]{ini.Replace("monster=487","monster=609"),ini.Replace("instance=3","instance=2"),ini.Replace("total=3","total=2")})Refused(()=>Replay(wrong));
            File.WriteAllText(Path.Combine(evidence,"mixed-packet.json"),packet.GetRawText());
            Require(GameRuntime.KnownFiles[LocalRosterRuntime.PluginKey]!=LocalRosterRuntime.PluginSha256);
            Require(LocalRosterRuntime.Expected(false)[LocalRosterRuntime.PluginKey]==GameRuntime.KnownFiles[LocalRosterRuntime.PluginKey]);
            string privateRoster=Path.Combine(AppContext.BaseDirectory,"roster-runtime","coe5se.c5plugin.dll");
            if(File.Exists(privateRoster))Require(GameRuntime.Hash(privateRoster)==LocalRosterRuntime.PluginSha256);else Require(!LocalRosterRuntime.Available());
        });
        string areaCandidate=Path.Combine(evidence,"area-candidate.json");
        if(File.Exists(areaCandidate))Check("Real area-5 battle preserves the code and independently bound five-defender roster",()=>{
            var c=TestCandidate.Read(JsonSerializer.Deserialize<JsonElement>(File.ReadAllText(areaCandidate)));
            var s=JsonSerializer.Deserialize<IsolatedTests.Session>(File.ReadAllText(Path.Combine(evidence,"area-session.json")))!;
            Require(c.AreaCode==5 && c.Target is {id:609,count:5} && c.Target==s.Target);
            var local=Path.Combine(folder,"area-replay");Directory.CreateDirectory(TestExchange.Area(local,c.ModId));
            string ini=File.ReadAllText(Path.Combine(evidence,"area-result.ini"));
            JsonElement Replay(string text){
                File.WriteAllText(TestExchange.ResultPath(local,s),text);
                return JsonSerializer.SerializeToElement(TestExchange.Results(local,s,c));
            }
            string currentLayout=Path.Combine(evidence,"area-layout-candidate.json");
            if(File.Exists(currentLayout)){
                var current=TestCandidate.Read(JsonSerializer.Deserialize<JsonElement>(File.ReadAllText(currentLayout)));
                Require(current.AreaCode==5 && current.Files[current.ModId+".lua"].Contains("ui.text(0,\"Area code 5 | nearby count\")"));
            }
            var packet=Replay(ini);Require(packet.GetProperty("context").GetProperty("areaCode").GetInt32()==5);
            var sample=packet.GetProperty("samples")[0];
            Require(sample.GetProperty("areaCode").GetInt32()==5 && sample.GetProperty("targetReading").GetProperty("units").GetArrayLength()==5);
            foreach(string wrong in new[]{ini.Replace("area=5","area=0"),ini.Replace("area=5",""),ini.Replace("area=5","area=6")})
                Require(Replay(wrong).GetProperty("samples").GetArrayLength()==0);
            File.WriteAllText(Path.Combine(evidence,"area-packet.json"),packet.GetRawText());
            var changed=System.Text.Json.Nodes.JsonNode.Parse(File.ReadAllText(areaCandidate))!;
            changed["source"]=changed["source"]!.GetValue<string>().Replace("aoe 5","aoe 4");
            Refused(()=>TestCandidate.Read(JsonSerializer.SerializeToElement(changed)));
        });
        string groupCandidate=Path.Combine(evidence,"group-candidate.json");
        if(File.Exists(groupCandidate))Check("Replay a real three-defender battle and reject forged, duplicate or partial rosters",()=>{
            var c=TestCandidate.Read(JsonSerializer.Deserialize<JsonElement>(File.ReadAllText(groupCandidate)));
            var session=JsonSerializer.Deserialize<IsolatedTests.Session>(File.ReadAllText(Path.Combine(evidence,"group-session.json")))!;
            Require(c.Target is {id:609,count:3} && c.Target==session.Target && session.Revision==GameRuntime.TextHash("c5m\0"+c.Source));
            var folderCopy=Path.Combine(folder,"group-replay");
            Directory.CreateDirectory(TestExchange.Area(folderCopy,c.ModId));
            string ini=File.ReadAllText(Path.Combine(evidence,"group-result.ini"));
            JsonElement Replay(string text,TestCandidate candidate) {
                File.WriteAllText(TestExchange.ResultPath(folderCopy,session),text);
                return JsonSerializer.SerializeToElement(TestExchange.Results(folderCopy,session,candidate));
            }
            var packet=Replay(ini,c);
            var units=packet.GetProperty("samples")[0].GetProperty("targetReading").GetProperty("units");
            Require(units.GetArrayLength()==3 && units.EnumerateArray().Select(u=>u.GetProperty("unit").GetInt32()).SequenceEqual(new[]{2,3,4}));
            Require(units.EnumerateArray().All(u=>u.GetProperty("resistance").GetInt32()==0));
            foreach(string wrong in new[]{ini.Replace("target=609","target=487"),ini.Replace("targetcount=3","targetcount=4"),
                ini.Replace("unit2=3,0","unit2=2,0"),ini.Replace("unit2=3,0",""),ini.Replace("unit2=3,0","unit2=3,"),ini.Replace("readback=1","other=1")})
                Require(Replay(wrong,c).GetProperty("samples").GetArrayLength()==0);
            var varied=Replay(ini.Replace("unit2=3,0","unit2=3,-25").Replace("unit3=4,0","unit3=4,unavailable"),c)
                .GetProperty("samples")[0].GetProperty("targetReading").GetProperty("units");
            Require(varied[1].GetProperty("resistance").GetInt32()==-25 && varied[2].GetProperty("resistance").ValueKind==JsonValueKind.Null);
            File.WriteAllText(Path.Combine(evidence,"group-packet.json"),packet.GetRawText());
        });
        string maximum=Path.Combine(evidence,"group-max-candidate.json");
        if(File.Exists(maximum))Check("Read 32 simulated battle samples with 200 individually identified defenders each",()=>{
            var c=TestCandidate.Read(JsonSerializer.Deserialize<JsonElement>(File.ReadAllText(maximum)));
            Require(c.Target is {count:200});
            var session=new IsolatedTests.Session{Id=new string('a',32),ResultRun=new string('b',32),ModId=c.ModId,
                Revision=GameRuntime.TextHash("c5m\0"+c.Source),Target=c.Target,Status="exited",WeaponEditing=true,PrivateRanged=true};
            var local=Path.Combine(folder,"max-group-replay");Directory.CreateDirectory(TestExchange.Area(local,c.ModId));
            string roster=string.Join("\n",Enumerable.Range(1,200).Select(i=>$"unit{i}={1000+i},unavailable"));
            var ini=new System.Text.StringBuilder($"[meta]\nschema=wb-ranged-results-1\nsession={session.Id}\nrun={session.ResultRun}\nmod={c.ModId}\nrevision={session.Revision}\ncount=32\n");
            for(int i=1;i<=32;i++)ini.Append($"\n[sample{i}]\nparameter=0\nbattles=1\nreadback=1\nlook=68\nflymode=1\nflylook=7\ntarget=609\ntargetcount=200\n{roster}\n");
            Require(ini.Length>65536);
            File.WriteAllText(TestExchange.ResultPath(local,session),ini.ToString());
            var samples=JsonSerializer.SerializeToElement(TestExchange.Results(local,session,c)).GetProperty("samples");
            Require(samples.GetArrayLength()==32 && samples[31].GetProperty("targetReading").GetProperty("units").GetArrayLength()==200);
        });
        string targetCandidate=Path.Combine(evidence,"target-candidate.json");
        if(File.Exists(targetCandidate))Check("Real Winter Wolf comparison binds defender ID, unit and pre-battle reading",()=>{
            var c=TestCandidate.Read(JsonSerializer.Deserialize<JsonElement>(File.ReadAllText(targetCandidate)));
            var s=JsonSerializer.Deserialize<IsolatedTests.Session>(File.ReadAllText(Path.Combine(evidence,"target-session.json")))!;
            Require(c.Target==new NativeTarget(487,"Winter Wolf") && c.Target==s.Target && s.Revision==GameRuntime.TextHash("c5m\0"+c.Source));
            string local=Path.Combine(folder,"target-replay"), ini=File.ReadAllText(Path.Combine(evidence,"target-result.ini"));
            Directory.CreateDirectory(TestExchange.Area(local,c.ModId));
            JsonElement Sample(string text) {
                File.WriteAllText(TestExchange.ResultPath(local,s),text);
                return JsonSerializer.SerializeToElement(TestExchange.Results(local,s,c)).GetProperty("samples");
            }
            var sample=Sample(ini);Require(sample.GetArrayLength()==1);
            var reading=sample[0].GetProperty("targetReading");
            Require(reading.GetProperty("id").GetInt32()==487 && reading.GetProperty("unit").GetInt32()==2 && reading.GetProperty("resistance").GetInt32()==100);
            foreach(string wrong in new[]{ini.Replace("target=487","target=609"),ini.Replace("targetunit=2","targetunit=-1"),ini.Replace("targetresistance=100","badkey=100")})
                Require(Sample(wrong).GetArrayLength()==0);
            Require(Sample(ini.Replace("targetresistance=100","targetresistance=unavailable"))[0].GetProperty("targetReading").GetProperty("resistance").ValueKind==JsonValueKind.Null);
        });
        string comparison=Path.Combine(evidence,"comparison-candidate.json");
        if(File.Exists(comparison))Check("Private visual comparison: pin the helper, bind real battle samples, reject a changed launch or invalid flight",()=>{
            var raw=File.ReadAllText(comparison);
            var candidate=TestCandidate.Read(JsonSerializer.Deserialize<JsonElement>(raw));
            Require(candidate.PrivateRanged && candidate.WeaponEditing && candidate.ComparisonBaseline!=null);
            var swapped=System.Text.Json.Nodes.JsonNode.Parse(raw)!;
            swapped["files"]!.AsArray().First(f=>f!["name"]!.GetValue<string>().EndsWith(".lua"))!["text"]="return";
            Refused(()=>TestCandidate.Read(JsonSerializer.SerializeToElement(swapped)));
            var session=JsonSerializer.Deserialize<IsolatedTests.Session>(File.ReadAllText(Path.Combine(evidence,"comparison-session.json")))!;
            Require(session.Revision==GameRuntime.TextHash("c5m\0"+candidate.Source) && session.ModId==candidate.ModId);
            var ini=File.ReadAllText(Path.Combine(evidence,"comparison-result.ini"));
            var local=Path.Combine(folder,"comparison-replay");
            Directory.CreateDirectory(TestExchange.Area(local,candidate.ModId));
            string path=TestExchange.ResultPath(local,session);
            JsonElement Replay(string text) {
                File.WriteAllText(path,text);return JsonSerializer.SerializeToElement(TestExchange.Results(local,session,candidate));
            }
            var packet=Replay(ini);
            Require(packet.GetProperty("context").GetProperty("resultSchema").GetInt32()==3);
            Require(packet.GetProperty("context").GetProperty("visualCatalog").GetInt32()==(candidate.ExpandedVisuals?2:1));
            var samples=packet.GetProperty("samples");Require(samples.GetArrayLength()==2 && samples[1].GetProperty("battleCount").GetInt32()==1);
            foreach(string wrong in new[]{System.Text.RegularExpressions.Regex.Replace(ini,@"(?m)^flylook=\d+","flylook=299"),ini.Replace("readback=1","readback=0"),
                ini.Replace("run="+session.ResultRun,"run="+new string('0',32)),ini.Replace("parameter=1","parameter=0")}) {
                var rejected=Replay(wrong);Require(rejected.GetProperty("samples").GetArrayLength()==0 && rejected.GetProperty("error").GetString()!=null);
            }
            File.WriteAllText(Path.Combine(evidence,"comparison-packet.json"),packet.GetRawText());
        });
        foreach (string route in new[] { "melee", "ranged" })
        {
            string inputPath=Path.Combine(Path.GetDirectoryName(Path.GetFullPath(reportFile))!, route+"-candidate.json");
            if (!File.Exists(inputPath)) continue;
            string candidateJson=File.ReadAllText(inputPath);
            Check("Private "+route+" canonical package preserves the exact source and has no return-enabled session",()=>{
                using var doc=JsonDocument.Parse(candidateJson);
                var candidate=TestCandidate.Read(doc.RootElement);
                Require(candidate.PrivateMelee==(route=="melee") && candidate.PrivateRanged==(route=="ranged"));
                Require(!candidate.OriginalRecord && !candidate.WeaponEditing);
                Require(candidate.Source==doc.RootElement.GetProperty("source").GetString());
            });
            foreach(var extension in new[]{".lua",".c5m","manifest.json","source"})
                Check("Private "+route+" refuses altered "+extension,()=>{
                    var node=System.Text.Json.Nodes.JsonNode.Parse(candidateJson)!;
                    if(extension=="source")node["source"]=node["source"]!.GetValue<string>()+"selectmonster 13";
                    else {
                        var file=node["files"]!.AsArray().Single(f=>f!["name"]!.GetValue<string>().EndsWith(extension,StringComparison.Ordinal))!;
                        if(extension=="manifest.json"){
                            var manifest=System.Text.Json.Nodes.JsonNode.Parse(file["text"]!.GetValue<string>())!;
                            manifest["payload"]="0";file["text"]=manifest.ToJsonString();
                        }else file["text"]=file["text"]!.GetValue<string>()+"\nchanged";
                    }
                    Refused(()=>TestCandidate.Read(JsonSerializer.SerializeToElement(node)));
                });
            if (route=="ranged")
            {
                foreach (string mismatch in new[]{"attack row","sprite","kind"})
                    Check("Private ranged refuses mismatched "+mismatch,()=>{
                        var node=System.Text.Json.Nodes.JsonNode.Parse(candidateJson)!;
                        if (mismatch=="sprite")
                            node["source"]=System.Text.RegularExpressions.Regex.Replace(node["source"]!.GetValue<string>(),
                                @"flylook (\d+)",m=>m.Groups[1].Value=="0"?"flylook 7":"flylook 0");
                        else {
                            bool row=mismatch=="attack row";
                            var file=node["files"]!.AsArray().Single(f=>f!["name"]!.GetValue<string>().EndsWith(row?".c5m":"manifest.json",StringComparison.Ordinal))!;
                            string content=file["text"]!.GetValue<string>();
                            file["text"]=row?content.Replace("rangedweapon ","meleeweapon "):content.Replace("private-ranged-v1","private-melee-v1");
                        }
                        Refused(()=>TestCandidate.Read(JsonSerializer.SerializeToElement(node)));
                    });
            }
        }
        foreach(string mode in new[]{"c5m","c5se"})
        {
            string selected=Path.Combine(Path.GetDirectoryName(Path.GetFullPath(reportFile))!,"selected-spell-"+mode+".json");
            if(File.Exists(selected))Check("Selected spell canonical boundary ("+mode+")",()=>{
                string json=File.ReadAllText(selected);using var doc=JsonDocument.Parse(json);var candidate=TestCandidate.Read(doc.RootElement);
                Require(candidate.Mode==mode&&candidate.WeaponEditing&&!candidate.PrivateRanged&&!candidate.PrivateMelee);
                Require(candidate.SpellName=="Harbor Ember Test"&&!candidate.Source.Contains("Harbor Ember Echo")&&!candidate.Source.Contains("Harbor Practice Guard"));
                var node=System.Text.Json.Nodes.JsonNode.Parse(json)!;node["source"]=node["source"]!.GetValue<string>()+"\nnewmonster \"Unrelated\"";
                Refused(()=>TestCandidate.Read(JsonSerializer.SerializeToElement(node)));
                node=System.Text.Json.Nodes.JsonNode.Parse(json)!;var file=node["files"]!.AsArray().Single(f=>f!["name"]!.GetValue<string>().EndsWith(".lua",StringComparison.Ordinal))!;file["text"]=file["text"]!.GetValue<string>()+"\nchanged";
                Refused(()=>TestCandidate.Read(JsonSerializer.SerializeToElement(node)));
            });
        }
        MixedComparisonSelfTest.Run(reportFile, Check);
        OriginalSelfTest.Run(reportFile, Check);
        RuntimeReleasesSelfTest.Run(reportFile, Check);
        OfficialMixedSelfTest.Run(reportFile, Check);
        OfficialComparisonSelfTest.Run(reportFile, Check);
        bool isolatedFixture = File.Exists(Path.Combine(Path.GetDirectoryName(Path.GetFullPath(reportFile))!, "isolated-package-input.json"));
        if (isolatedFixture) IsolatedTestsSelfTest.Run(reportFile, Check);
        Check("WebView2 runtime detection (no window)", () => { runtime = Microsoft.Web.WebView2.Core.CoreWebView2Environment.GetAvailableBrowserVersionString(); Require(!string.IsNullOrWhiteSpace(runtime)); });
        bool pass = checks.All(x => JsonSerializer.Serialize(x).Contains("\"pass\":true"));
        File.WriteAllText(reportFile, JsonSerializer.Serialize(new { passed = pass, tests = checks.Count, checks, runtime, isolatedFixture, scope = "Compiled native file/policy logic, optional isolated-session fixtures and substitute workbench child process; no WebView window, dialogs, keyboard or game launched." }, new JsonSerializerOptions { WriteIndented = true }));
        return pass ? 0 : 1;
    }
}
