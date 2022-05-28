import React from 'react'
import { createStyles, Paper, Text, ThemeIcon } from '@mantine/core'
// import { ColorSwatch } from 'tabler-icons-react'

const useStyles = createStyles((theme) => ({
  card: {
    position: 'relative',
    cursor: 'pointer',
    overflow: 'hidden',
    transition: 'transform 150ms ease, box-shadow 100ms ease',
    padding: theme.spacing.xl,
    paddingLeft: theme.spacing.xl * 2,
    width: 300,

    '&:hover': {
      boxShadow: theme.shadows.md,
      transform: 'scale(1.02)',
    },

    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      bottom: 0,
      left: 0,
      width: 6,
      backgroundImage: theme.fn.linearGradient(0, 'teal', 'teal'),
    },
  },
}))

interface CardGradientProps {
  title: string
  messages: Array<string>
}

export function Greetings({ title, messages }: CardGradientProps) {
  const { classes } = useStyles()
  return (
    <Paper withBorder radius="md" className={classes.card}>
      <ThemeIcon
        size="xl"
        radius="md"
        variant="gradient"
        gradient={{ deg: 0, from: 'teal', to: 'teal' }}
      >
        {/* <ColorSwatch size={28} /> */}
      </ThemeIcon>
      <Text size="xl" weight={500} mt="md">
        {title}
      </Text>
      {messages.map((msg, i) => {
        return (
          <Text key={i} size="sm" mt="sm" color="dimmed">
            {msg}
          </Text>
        )
      })}
    </Paper>
  )
}
