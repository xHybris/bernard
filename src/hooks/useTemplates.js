import { v4 as uuid } from 'uuid'
import { useLocalStorage } from './useLocalStorage'

export function useTemplates() {
  const [templates, setTemplates] = useLocalStorage('bernard_templates', [])

  const addTemplate = (name, exercises) => {
    const template = {
      id: uuid(),
      name,
      createdAt: new Date().toISOString(),
      exercises,
    }
    setTemplates((previousTemplates) => [...previousTemplates, template])
    return template
  }

  const updateTemplate = (id, updates) => {
    setTemplates((previousTemplates) =>
      previousTemplates.map((template) =>
        template.id === id ? { ...template, ...updates } : template,
      ),
    )
  }

  const deleteTemplate = (id) => {
    setTemplates((previousTemplates) =>
      previousTemplates.filter((template) => template.id !== id),
    )
  }

  const getTemplateById = (id) => templates.find((template) => template.id === id)

  return { templates, addTemplate, updateTemplate, deleteTemplate, getTemplateById }
}
