/* Executes the actual modified field headers against a deterministic native-memory model. No game process. */
#include <stdlib.h>
#include <string.h>
#include <stdio.h>
#include <stdarg.h>
#include "lua.h"
#include "lauxlib.h"
#include "lualib.h"
#define UNIT_TABLE_MAX 256
#define UNIT_SIZE 64
#define COMMANDER_TABLE_MAX 16
#define COMMANDER_SIZE 64
#define SQUARE_SIZE 64
#define MAP_COLUMN_SQUARES 4
#define PLAYER_BLOCK_SIZE 16
#define RVA_UNITS 4096
#define RVA_UNIT_X (RVA_UNITS+16)
#define RVA_UNIT_HP (RVA_UNITS+8)
#define RVA_COMMANDER_NAMES 24000
#define RVA_COMMANDERS (RVA_COMMANDER_NAMES+48)
#define RVA_SQUARE_RECORDS 30000
#define RVA_SQUARES (RVA_SQUARE_RECORDS+2)
#define RVA_SQUARE_ARMY 31000
#define SQUARE_ARMY_OWNER 4
#define SQUARE_HOLDER 6
#define RVA_SLOT_TEAM 32000
#define RVA_ACTIVE_PLAYER 16
#define RVA_UNIT_COUNT 20
#define RVA_LAST_COMMANDER 24
#define RVA_MAP_W 28
#define RVA_MAP_H 32
#define RVA_BATTLE_DELAY 36
#define RVA_TEST_GAME_FLAG 40
#define RVA_FRAME_DELAY_MS 44
#define RVA_BATTLE_SCREEN_CARRY_US 48
#define RVA_UNIT_MEMORIZED_SPELLS (RVA_UNITS+32)
#define MONSTER_ATTACKS 0
#define MONSTER_ATTACK_WEAPON 0
#define TABLE_WEAPON 1
#define WEAPON_RECORDS_MOVED 7000
#define WEAPON_SIZE 160
#define WEAPON_RANGE 68
#define WEAPON_NAME_MAX 63
#define VISUAL_FX_ROWS 300
#define RVA_VISUAL_FX_TABLE 33000
#define VISUAL_FX_SIZE 16
#define RVA_BATTLE_OVER 52
#define RVA_MOD_LAST_INDEX 56
#define RVA_BATTLE_X 60
#define RVA_BATTLE_Y 64
#define RVA_BATTLE_PLAYER_A 68
#define RVA_BATTLE_PLAYER_B 72
#define RVA_NEW_COMMANDER 100001
#define RVA_NEW_UNIT 100002
#define RVA_ADD_KNOWN_SPELL 100003
#define RVA_BATTLE_SETUP 100004
#define RVA_BATTLE_DEPLOY 100005
#define RVA_BATTLE_SCREEN 100006
#define RVA_DOATTACK 100007
#define RVA_FLY_WEAPONS_STEP 100008
#define RVA_FIGHT_THE_FIGHT 100009
static unsigned char mem[65536],baseline[65536],monster[64];
#define GAME_PTR(r) (mem+(r))
#define G32(r) (*(int*)GAME_PTR(r))
unsigned coe5seMakeLuaSeed(void){return 12345;}
unsigned coe5seHashLuaFloat(lua_Number n){return (unsigned)n;}
void coe5seChargeLuaSteps(lua_State *L,size_t n){(void)L;(void)n;}
static int allocationCalls,failAfter=-1;
static int newUnit(int x,int y,int owner,int leader,int kind){
 (void)owner;(void)leader;(void)kind;
 if(failAfter>=0 && allocationCalls++>=failAfter)return -1;
 int u=++G32(RVA_UNIT_COUNT);
 if(u>=UNIT_TABLE_MAX)return -1;
 G32(RVA_UNIT_X+u*UNIT_SIZE)=x;G32(RVA_UNIT_X+u*UNIT_SIZE+4)=y;
 *(short*)GAME_PTR(RVA_UNIT_HP+u*UNIT_SIZE)=6;return u;
}
static int newCommander(int x,int y,int owner,int kind){
 int u=newUnit(x,y,owner,-1,kind);if(u<0)return -1;
 int c=++G32(RVA_LAST_COMMANDER);G32(RVA_COMMANDERS+c*COMMANDER_SIZE)=u;return c;
}
static void nothing(void){}
static void *nativeFunction(int r){
 if(r==RVA_NEW_UNIT)return (void*)newUnit;
 if(r==RVA_NEW_COMMANDER)return (void*)newCommander;
 return (void*)nothing;
}
#define GAME_FN(type,r) ((type)nativeFunction(r))
typedef struct { const char*mod; } LuaScript;
static LuaScript script={"Test"};
static LuaScript *checkLuaScript(lua_State *L){(void)L;return &script;}
static void writeLog(const char *a,const char *fmt,...){(void)a;(void)fmt;}
static void refuseLuaCall(const char*a,const char*b,const char*c,const char*d,...){(void)a;(void)b;(void)c;(void)d;}
static int isUsedMonster(lua_Integer m){return m>=0 && m<20;}
static void *monsterRecord(int m){(void)m;return monster;}
typedef struct {const char*name;int path,level,weapon,dmg;} SpellRecord;
static SpellRecord spell={"S",1,1,0,1};
static int spellTableRecords(void){return 1;}
static const SpellRecord *spellSlot(int s){(void)s;return &spell;}
static int weaponMadeBy[7000];
static const char *modName(int n){(void)n;return "Test";}
static int tableRecords(int t){(void)t;return 1;}
static unsigned char *tableAddress(int t){(void)t;return mem+34000;}
#define _stricmp stricmp
#include "../CoE5SE/src/lua_test_battle.h"
#include "../CoE5SE/src/wb_roster.h"
static void reset(void){
 memset(mem,0,sizeof mem);memset(mem+30000,0x35,1024);
 G32(RVA_ACTIVE_PLAYER)=-1;G32(RVA_LAST_COMMANDER)=-1;G32(RVA_MAP_W)=30;G32(RVA_MAP_H)=20;
 G32(RVA_BATTLE_DELAY)=47;G32(RVA_TEST_GAME_FLAG)=2;
 allocationCalls=0;failAfter=-1;testField.open=0;wbRoster=NULL;
 memcpy(baseline,mem,sizeof mem);
}
static int fail(lua_State *L){failAfter=(int)luaL_checkinteger(L,1);return 0;}
int main(void){
 const char *tests[]={
 "local ok=coe5.withTestFieldRoster(1,{{monster=2,count=2},{monster=3,count=1}},function(u) assert(#u==3 and u[1].unit==2 and u[3].monster==3 and coe5.testFieldRosterStatus().open) end);assert(ok)",
 "local ok,e=coe5.withTestFieldRoster(1,{{monster=2,count=3}},function() error('cancel') end);assert(not ok and e:find('cancel'))",
 "failAfter(2);local called=false;local ok=coe5.withTestFieldRoster(1,{{monster=2,count=2},{monster=3,count=1}},function() called=true end);assert(not ok and not called)",
 "failAfter(0);assert(not coe5.withTestFieldRoster(1,{{monster=2,count=1}},function() error('must not run') end))",
 "local ok=pcall(coe5.withTestFieldRoster,1,{{monster=2,count=201}},function() error('called') end);assert(not ok)",
 "local ok=coe5.withTestFieldRoster(1,{{monster=2,count=100},{monster=3,count=100}},function(u) assert(#u==200) end);assert(ok)",
 "assert(coe5.withTestFieldRoster(1,{{monster=2,count=1}},function() assert(not coe5.withTestFieldRoster(1,{{monster=3,count=1}},function() end)) end))",
 "assert(coe5.withTestFieldRoster(1,{{monster=2,count=1}},function() coe5.closeTestField();assert(not coe5.openTestField(1,-1,2,200)) end))",
 "failAfter(1);assert(not coe5.withTestFieldRoster(1,{{monster=2,count=2}},function() error('called') end));failAfter(999);assert(coe5.withTestFieldRoster(1,{{monster=2,count=2}},function(u) assert(#u==2) end))"
 };
 for(size_t i=0;i<sizeof tests/sizeof *tests;i++){
  reset();lua_State *L=luaL_newstate();luaL_requiref(L,"_G",luaopen_base,1);lua_pop(L,1);luaL_requiref(L,"string",luaopen_string,1);lua_pop(L,1);
  lua_newtable(L);
  lua_pushcfunction(L,lWithTestFieldRoster);lua_setfield(L,-2,"withTestFieldRoster");
  lua_pushcfunction(L,lWbRosterStatus);lua_setfield(L,-2,"testFieldRosterStatus");
  lua_pushcfunction(L,lOpenTestField);lua_setfield(L,-2,"openTestField");
  lua_pushcfunction(L,lCloseTestField);lua_setfield(L,-2,"closeTestField");lua_setglobal(L,"coe5");
  lua_pushcfunction(L,fail);lua_setglobal(L,"failAfter");
  if(luaL_dostring(L,tests[i])!=LUA_OK){fprintf(stderr,"case %zu: %s\n",i+1,lua_tostring(L,-1));return 1;}
  if(memcmp(mem,baseline,sizeof mem)||testField.open||wbRoster){fprintf(stderr,"case %zu leaked state\n",i+1);return 2;}
  lua_close(L);printf("case %zu passed\n",i+1);
 }
 return 0;
}
