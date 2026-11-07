/* Workbench local extension, based on CoE5SE 2.13.0. Windows 5.43 only.
   The public field API remains unchanged. This entry owns allocations and cleanup across a protected Lua callback. */
#pragma once
#ifndef _WIN32
static int lWbRosterStatus(lua_State *L){lua_pushnil(L);return 1;}
static int lWithTestFieldRoster(lua_State *L){return luaL_error(L,"Workbench roster-v1 is available only in the local Windows build");}
#else
static int wbRosterRestored;
static const size_t wbUnitBytes=(size_t)UNIT_TABLE_MAX*UNIT_SIZE;
static const size_t wbCommanderBytes=(size_t)COMMANDER_TABLE_MAX*COMMANDER_SIZE+0x30;

static int lWbRosterStatus(lua_State *L) {
    lua_createtable(L,0,3);
    lua_pushboolean(L,testField.open);lua_setfield(L,-2,"open");
    lua_pushboolean(L,wbRosterRestored);lua_setfield(L,-2,"restored");
    lua_pushinteger(L,1);lua_setfield(L,-2,"version");
    return 1;
}
static int wbRosterInvoke(lua_State *L) {
    WbRoster *r=lua_touserdata(L,1);
    lua_settop(L,0);
    lua_pushinteger(L,r->carrier);lua_pushinteger(L,-1);
    lua_pushinteger(L,r->monsters[0]);lua_pushinteger(L,r->count);
    r->opening=1;
    int result=lOpenTestField(L);
    r->opening=0;
    if(result!=1 || !lua_toboolean(L,-1))return luaL_error(L,"Roster allocation refused; field rolled back");
    lua_settop(L,0);
    lua_rawgeti(L,LUA_REGISTRYINDEX,r->callback);
    lua_createtable(L,r->count,0);
    for(int i=0;i<r->count;i++){
        lua_createtable(L,0,2);
        lua_pushinteger(L,r->units[i]);lua_setfield(L,-2,"unit");
        lua_pushinteger(L,r->monsters[i]);lua_setfield(L,-2,"monster");
        lua_rawseti(L,-2,i+1);
    }
    lua_call(L,1,0); /* The outer pcall covers this callback and all Lua allocation failures. */
    return 0;
}
static int lWithTestFieldRoster(lua_State *L) {
    WbRoster r={0};
    lua_Integer carrier=luaL_checkinteger(L,1);
    luaL_checktype(L,2,LUA_TTABLE);luaL_checktype(L,3,LUA_TFUNCTION);
    if(testField.open || wbRoster || G32(RVA_ACTIVE_PLAYER)>=0 || !isUsedMonster(carrier)){
        lua_pushboolean(L,0);lua_pushliteral(L,"Field unavailable or invalid carrier");return 2;
    }
    size_t groups=lua_rawlen(L,2);
    if(groups<1 || groups>8)return luaL_error(L,"Roster requires 1–8 native types");
    for(size_t i=1;i<=groups;i++){
        lua_rawgeti(L,2,(lua_Integer)i);luaL_checktype(L,-1,LUA_TTABLE);
        lua_getfield(L,-1,"monster");lua_Integer monster=luaL_checkinteger(L,-1);lua_pop(L,1);
        lua_getfield(L,-1,"count");lua_Integer count=luaL_checkinteger(L,-1);lua_pop(L,2);
        if(!isUsedMonster(monster) || count<1 || count>TEST_BATTLE_ENEMIES_MAX-r.count)
            return luaL_error(L,"Invalid monster or roster total (maximum 200)");
        for(int n=0;n<count;n++)r.monsters[r.count++]=(int)monster;
    }
    r.carrier=(int)carrier;
    lua_pushvalue(L,3);r.callback=luaL_ref(L,LUA_REGISTRYINDEX);
    r.unitsSaved=malloc(wbUnitBytes);r.commandersSaved=malloc(wbCommanderBytes);
    if(!r.unitsSaved || !r.commandersSaved){
        free(r.unitsSaved);free(r.commandersSaved);luaL_unref(L,LUA_REGISTRYINDEX,r.callback);
        lua_pushboolean(L,0);lua_pushliteral(L,"Roster snapshot allocation failed");return 2;
    }
    memcpy(r.unitsSaved,GAME_PTR(RVA_UNITS),wbUnitBytes);
    memcpy(r.commandersSaved,GAME_PTR(RVA_COMMANDER_NAMES),wbCommanderBytes);
    r.unitCount=G32(RVA_UNIT_COUNT);r.commanderCount=G32(RVA_LAST_COMMANDER);
    size_t squareIndex=(size_t)TEST_BATTLE_X*MAP_COLUMN_SQUARES+TEST_BATTLE_Y;
    unsigned char *square=GAME_PTR(RVA_SQUARE_RECORDS+squareIndex*SQUARE_SIZE);
    short *army=(short*)GAME_PTR(RVA_SQUARE_ARMY+squareIndex*2);
    short *teamA=(short*)GAME_PTR(RVA_SLOT_TEAM),*teamB=(short*)GAME_PTR(RVA_SLOT_TEAM+(size_t)TEST_BATTLE_ENEMY_PLAYER*PLAYER_BLOCK_SIZE);
    memcpy(r.square,square,SQUARE_SIZE);r.army=*army;r.teamA=*teamA;r.teamB=*teamB;
    r.mapW=G32(RVA_MAP_W);r.mapH=G32(RVA_MAP_H);r.active=G32(RVA_ACTIVE_PLAYER);r.delay=G32(RVA_BATTLE_DELAY);
    r.show=G32(RVA_TEST_GAME_FLAG);
    r.battleX=G32(RVA_BATTLE_X);r.battleY=G32(RVA_BATTLE_Y);r.playerA=G32(RVA_BATTLE_PLAYER_A);r.playerB=G32(RVA_BATTLE_PLAYER_B);r.over=G32(RVA_BATTLE_OVER);r.carry=G32(RVA_BATTLE_SCREEN_CARRY_US);
    wbRoster=&r;wbRosterRestored=0;
    lua_pushcfunction(L,wbRosterInvoke);lua_pushlightuserdata(L,&r);
    int rc=lua_pcall(L,1,0,0);
    closeTestFieldNow();
    memcpy(GAME_PTR(RVA_UNITS),r.unitsSaved,wbUnitBytes);
    memcpy(GAME_PTR(RVA_COMMANDER_NAMES),r.commandersSaved,wbCommanderBytes);
    *(int*)GAME_PTR(RVA_UNIT_COUNT)=r.unitCount;
    *(int*)GAME_PTR(RVA_LAST_COMMANDER)=r.commanderCount;
    memcpy(square,r.square,SQUARE_SIZE);*army=r.army;*teamA=r.teamA;*teamB=r.teamB;
    *(int*)GAME_PTR(RVA_MAP_W)=r.mapW;*(int*)GAME_PTR(RVA_MAP_H)=r.mapH;
    *(int*)GAME_PTR(RVA_ACTIVE_PLAYER)=r.active;*(int*)GAME_PTR(RVA_BATTLE_DELAY)=r.delay;
    *(int*)GAME_PTR(RVA_TEST_GAME_FLAG)=r.show;
    *(int*)GAME_PTR(RVA_BATTLE_X)=r.battleX;*(int*)GAME_PTR(RVA_BATTLE_Y)=r.battleY;
    *(int*)GAME_PTR(RVA_BATTLE_PLAYER_A)=r.playerA;*(int*)GAME_PTR(RVA_BATTLE_PLAYER_B)=r.playerB;
    *(int*)GAME_PTR(RVA_BATTLE_OVER)=r.over;*(int*)GAME_PTR(RVA_BATTLE_SCREEN_CARRY_US)=r.carry;
    wbRosterRestored=!testField.open && !memcmp(square,r.square,SQUARE_SIZE) && *army==r.army &&
        *teamA==r.teamA && *teamB==r.teamB && G32(RVA_UNIT_COUNT)==r.unitCount && G32(RVA_LAST_COMMANDER)==r.commanderCount &&
        G32(RVA_ACTIVE_PLAYER)==r.active && G32(RVA_MAP_W)==r.mapW && G32(RVA_MAP_H)==r.mapH &&
        G32(RVA_BATTLE_X)==r.battleX && G32(RVA_BATTLE_Y)==r.battleY && G32(RVA_BATTLE_PLAYER_A)==r.playerA && G32(RVA_BATTLE_PLAYER_B)==r.playerB &&
        G32(RVA_BATTLE_DELAY)==r.delay && G32(RVA_BATTLE_OVER)==r.over && G32(RVA_TEST_GAME_FLAG)==r.show && G32(RVA_BATTLE_SCREEN_CARRY_US)==r.carry && !memcmp(GAME_PTR(RVA_UNITS),r.unitsSaved,wbUnitBytes) &&
        !memcmp(GAME_PTR(RVA_COMMANDER_NAMES),r.commandersSaved,wbCommanderBytes);
    free(r.unitsSaved);free(r.commandersSaved);wbRoster=NULL;
    luaL_unref(L,LUA_REGISTRYINDEX,r.callback);
    writeLog("wb_roster_closed","version=1 made=%d requested=%d callback_ok=%d records_restored=%d",r.made,r.count,rc==LUA_OK,wbRosterRestored);
    if(rc!=LUA_OK){lua_pushboolean(L,0);lua_insert(L,-2);return 2;}
    lua_pushboolean(L,wbRosterRestored);return 1;
}
#endif
