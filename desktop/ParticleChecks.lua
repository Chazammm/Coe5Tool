      local flightName=coe5.lookName(flight)
      if flightName~={{FLIGHTNAME}} then error("Particle flight effect is missing or differs from the documented selection.") end
      meta.flightname=flightName
      if impact>=0 then
        local impactName=coe5.lookName(impact)
        if impactName~={{IMPACTNAME}} then error("Impact effect differs from the documented selection.") end
        meta.impactname=impactName
      end

