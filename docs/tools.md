# Tools — L2 reference

## list_roles

- Input : `{ category?, locale? }`
- Output : `{ roles[], count, fetchedAt }`
- See `src/tools/list_roles.ts`.

## list_personas

- Input : `{ axis?, locale? }`
- Output : `{ personas[], count, fetchedAt }`
- See `src/tools/list_personas.ts`.

## compose_agent

- Input : `{ role_id, persona_id, framework_id?, skills?, context, locale?, format? }`
- Output : `{ agent_id, role, persona, framework, skills, composed_output, composition_notes, format, fetchedAt }`
- See `src/tools/compose_agent.ts`.

## suggest_composition

- Input : `{ goal, constraints?, locale? }`
- Output : `{ suggestions[<=3], fetchedAt }`
- See `src/tools/suggest_composition.ts`.

## validate_composition

- Input : `{ role_id, persona_id, framework_id?, skills?, locale? }`
- Output : `{ valid, warnings[], recommendations[], recommendations_fr[], compatibility_score, fetchedAt }`
- See `src/tools/validate_composition.ts`.
