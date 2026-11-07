-- Pinned 5.43 / 2.13.0 starts new weapon and monster slots at 1200 and 2000.
      if weapon<1200 or carrier<2000 then error("Expected new private ranged records.") end
      local mode=coe5.get("weapon",weapon,"flymode")
      local {{FLIGHTVAR}}=coe5.get("weapon",weapon,"flylook")
      local impact=coe5.get("weapon",weapon,"look")
      if mode~={{MODE}} or {{FLIGHTVAR}}~={{FLIGHT}} or impact~={{IMPACT}} then error("Loaded projectile or impact differs from the draft.") end
      if impact>=0 and not coe5.lookName(impact) then error("Impact effect is unavailable in this runtime.") end
{{PARTICLECHECK}}      meta.range,meta.flymode,meta.flylook,meta.look={{RANGE}},mode,{{FLIGHTVAR}},impact
