export const MUSCLE_GROUPS = [
  { slug: 'pectoraux', name: 'Pectoraux' },
  { slug: 'dos', name: 'Dos' },
  { slug: 'epaules', name: 'Épaules' },
  { slug: 'biceps', name: 'Biceps' },
  { slug: 'triceps', name: 'Triceps' },
  { slug: 'jambes', name: 'Jambes' },
  { slug: 'abdos', name: 'Abdos' },
]

export const MUSCLE_GROUP_NAMES = Object.fromEntries(
  MUSCLE_GROUPS.map((group) => [group.slug, group.name]),
)
