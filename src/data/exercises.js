export const PREDEFINED_EXERCISES = [
  { id: 'pectoraux_developpe-couche', name: 'Développé couché', muscleGroup: 'pectoraux' },
  { id: 'pectoraux_developpe-incline', name: 'Développé incliné', muscleGroup: 'pectoraux' },
  { id: 'pectoraux_ecarte-couche', name: 'Écarté couché', muscleGroup: 'pectoraux' },
  { id: 'pectoraux_dips', name: 'Dips', muscleGroup: 'pectoraux' },
  { id: 'pectoraux_pompes', name: 'Pompes', muscleGroup: 'pectoraux' },

  { id: 'dos_tractions', name: 'Tractions', muscleGroup: 'dos' },
  { id: 'dos_rowing-barre', name: 'Rowing barre', muscleGroup: 'dos' },
  { id: 'dos_rowing-haltere', name: 'Rowing haltère', muscleGroup: 'dos' },
  { id: 'dos_tirage-vertical', name: 'Tirage vertical', muscleGroup: 'dos' },
  { id: 'dos_tirage-horizontal', name: 'Tirage horizontal', muscleGroup: 'dos' },

  { id: 'epaules_developpe-militaire', name: 'Développé militaire', muscleGroup: 'epaules' },
  { id: 'epaules_elevations-laterales', name: 'Élévations latérales', muscleGroup: 'epaules' },
  { id: 'epaules_elevations-frontales', name: 'Élévations frontales', muscleGroup: 'epaules' },
  { id: 'epaules_oiseau', name: 'Oiseau', muscleGroup: 'epaules' },
  { id: 'epaules_shrug', name: 'Shrug', muscleGroup: 'epaules' },

  { id: 'biceps_curl-barre', name: 'Curl barre', muscleGroup: 'biceps' },
  { id: 'biceps_curl-halteres', name: 'Curl haltères', muscleGroup: 'biceps' },
  { id: 'biceps_curl-marteau', name: 'Curl marteau', muscleGroup: 'biceps' },
  { id: 'biceps_curl-concentre', name: 'Curl concentré', muscleGroup: 'biceps' },

  { id: 'triceps_extension-poulie', name: 'Extension poulie', muscleGroup: 'triceps' },
  { id: 'triceps_barre-au-front', name: 'Barre au front', muscleGroup: 'triceps' },
  { id: 'triceps_dips-triceps', name: 'Dips triceps', muscleGroup: 'triceps' },
  { id: 'triceps_kickback', name: 'Kickback', muscleGroup: 'triceps' },

  { id: 'jambes_squat', name: 'Squat', muscleGroup: 'jambes' },
  { id: 'jambes_presse-a-cuisses', name: 'Presse à cuisses', muscleGroup: 'jambes' },
  { id: 'jambes_fentes', name: 'Fentes', muscleGroup: 'jambes' },
  { id: 'jambes_leg-extension', name: 'Leg extension', muscleGroup: 'jambes' },
  { id: 'jambes_leg-curl', name: 'Leg curl', muscleGroup: 'jambes' },
  { id: 'jambes_mollets', name: 'Mollets', muscleGroup: 'jambes' },

  { id: 'abdos_crunch', name: 'Crunch', muscleGroup: 'abdos' },
  { id: 'abdos_planche', name: 'Planche', muscleGroup: 'abdos' },
  { id: 'abdos_releve-de-jambes', name: 'Relevé de jambes', muscleGroup: 'abdos' },
  { id: 'abdos_russian-twist', name: 'Russian twist', muscleGroup: 'abdos' },
]

export function getExercisesByGroup(group) {
  return PREDEFINED_EXERCISES.filter((exercise) => exercise.muscleGroup === group)
}
