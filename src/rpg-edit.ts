interface Character {
  firstName: string
  lastName: string
  age: number | null
  description: string
}

const globalSpacer: string = '|||'
const fieldSpacer: string = '|-|'
const innerFieldSpacer: string = '|=|'

const getProp = (props: [string, string][], prop: string): string | null => (
  props.find(p => p[0] === prop)?.[1] ?? null
)

const blankCharacter: Character = {
  firstName: '',
  lastName: '',
  age: null,
  description: ''
}

const decodeCharacter = (acc: Character[], src: string): Character[] => {
  try {
    const properties: [string, string][] = src.split(fieldSpacer)
      .filter(l => l.trim() != '')
      .map((line) => {
        const prop = line.split(innerFieldSpacer)
        if (prop.length !== 2) {
          throw new Error('Invalid line')
        }

        const key: string = prop[0]
        const value: string = prop[1]

        return [key, value]
      }, {})

    if (properties.length === 0) {
      return acc
    }

    const rawAge: string | null = getProp(properties, 'age')

    const age: number | null = (rawAge ? parseInt(rawAge, 10) : null)

    const character: Character = {
      firstName: getProp(properties, 'firstName') ?? blankCharacter.firstName,
      lastName: getProp(properties, 'lastName') ?? blankCharacter.lastName,
      age: age != null ? (isNaN(age) ? null : age) : blankCharacter.age,
      description: getProp(properties, 'description') ?? blankCharacter.description
    }

    return acc.concat([character])
  } catch (err) {
    console.error(err)
    return acc
  }
}

const characterClass: string = 'fp-character'
const fieldValueClass: string = 'fp-field-value'

const updateFields = (wrapper: Element, baseField: Element) => (): void => {
  const characters = wrapper.getElementsByClassName(characterClass)

  const serializedChars: string[] = []
  for (let i = 0; i < characters.length; i++) {
    const character = characters[i]
    const fields = character.getElementsByClassName(fieldValueClass)

    const values: string[] = []
    for (let idx = 0; idx < fields.length; idx++) {
      const field = fields[idx]
      const key: string | null = field?.getAttribute('name')
      const value: string | null = (field as any)?.value
      if (key && value) {
        const serializedValue = `${key}${innerFieldSpacer}${value}`
        values.push(serializedValue)
      }
    }

    serializedChars.push(values.join(fieldSpacer))
  }
  (baseField as any).value = serializedChars.join(globalSpacer)
}

const createCharacterField = (wrapper: Element, baseField: Element) => (character: Character): Element => {
  // Create character wrapper
  const characterWrapper: Element = document.createElement('div')
  characterWrapper.className = characterClass

  // Create name field
  const firstNameField: Element = document.createElement('input')
  firstNameField.setAttribute('type', 'text')
  firstNameField.setAttribute('name', 'firstName')
  firstNameField.setAttribute('placeholder', 'nom du personnage')
  firstNameField.setAttribute('value', character.firstName)
  firstNameField.addEventListener('input', updateFields(wrapper, baseField))
  firstNameField.className = fieldValueClass

  // Create age field
  const ageField: Element = document.createElement('input')
  ageField.setAttribute('type', 'number')
  ageField.setAttribute('name', 'age')
  ageField.setAttribute('placeholder', 'âge')
  ageField.setAttribute('value', character.age?.toString() ?? '')
  ageField.addEventListener('input', updateFields(wrapper, baseField))
  ageField.className = fieldValueClass

  // Compose and return wrapper
  characterWrapper.appendChild(firstNameField)
  characterWrapper.appendChild(ageField)
  return characterWrapper
}

const handleCharacters = (
  name: string,
  globalWrapper: Element,
  field: Element
): void => {
  const wrapper: Element = document.createElement('div')
  wrapper.className = 'fp-char-edit-fields'
  const rawField: Element | null = field.getElementsByTagName('textarea')[0]
  if (rawField == null) {
    console.error('Could not find field "Personnages" :(')
    return
  }

  const rawData: string | null = (rawField as any | null)?.value ?? null

  // Create field title
  const title: Element = document.createElement('h3')
  title.innerHTML = name
  title.className = 'charsheet-title'

  // Parse characters
  const characters: Character[] = rawData != null
    ? rawData.split(globalSpacer).reduce(decodeCharacter, [])
    : []

  const wrappers: Element[] = characters.map(createCharacterField(wrapper, rawField))

  // "Plus" button
  const plusButton: Element = document.createElement('button')
  plusButton.addEventListener('click', () => {
    wrapper.appendChild(createCharacterField(wrapper, rawField)(blankCharacter))
  })
  plusButton.setAttribute('type', 'button')
  plusButton.innerHTML = '+'

  // Append fields
  wrapper.appendChild(title)
  wrappers.forEach(characterWrapper => {
    wrapper.appendChild(characterWrapper)
  })
  globalWrapper.appendChild(wrapper)
  globalWrapper.appendChild(plusButton)
}

// Process fields
const fields: HTMLCollectionOf<Element> = document.getElementsByClassName('fp-field-edit')

for (let i = 0; i < fields.length; i++) {
  const field: Element = fields[i]
  const fieldname: string | null = field.getElementsByTagName('dt')[0]?.textContent?.trim() ?? null
  const fieldElement: Element | null = field.getElementsByTagName('dd')[0]
  if (fieldname && fieldElement) {
    switch (fieldname) {
      case 'Personnages': {
        handleCharacters(fieldname, field, fieldElement)
        break
      }
    }
  }
}
