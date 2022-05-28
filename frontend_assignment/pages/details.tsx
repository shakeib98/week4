import React, { useCallback, useState } from 'react'
import {
  TextInput,
  createStyles,
  NumberInput,
  ActionIcon,
  Button,
} from '@mantine/core'
import { Plus, Minus } from 'tabler-icons-react'
import { useForm } from 'react-hook-form'
import styles from '../styles/Home.module.css'
import Head from 'next/head'
import { object, string, number } from 'yup'

const validationSchema = object({
  firstName: string().required(),
  age: number().required().positive().integer(),
  address: string().required(),
})

const useYupValidationResolver = (validationSchema: any) =>
  useCallback(
    async (data) => {
      try {
        const values = await validationSchema.validate(data, {
          abortEarly: false,
        })

        return {
          values,
          errors: {},
        }
      } catch (errors) {
        return {
          values: {},
          errors: errors.inner.reduce(
            (allErrors, currentError) => ({
              ...allErrors,
              [currentError.path]: {
                type: currentError.type ?? 'validation',
                message: currentError.message,
              },
            }),
            {},
          ),
        }
      }
    },
    [validationSchema],
  )

const useStyles = createStyles((theme) => ({
  root: {
    position: 'relative',
  },

  label: {
    position: 'absolute',
    pointerEvents: 'none',
    fontSize: theme.fontSizes.xs,
    paddingLeft: theme.spacing.sm,
    paddingTop: theme.spacing.sm / 2,
    zIndex: 1,
  },
  wrapper: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: `6px ${theme.spacing.xs}px`,
    borderRadius: theme.radius.sm,
    border: `1px solid ${
      theme.colorScheme === 'dark' ? 'transparent' : theme.colors.gray[3]
    }`,
    backgroundColor:
      theme.colorScheme === 'dark' ? theme.colors.dark[5] : theme.white,

    '&:focus-within': {
      borderColor: theme.colors[theme.primaryColor][6],
    },
    fontWeight: 'bold',
    margin: 2,
  },

  control: {
    backgroundColor:
      theme.colorScheme === 'dark' ? theme.colors.dark[7] : theme.white,
    border: `1px solid ${
      theme.colorScheme === 'dark' ? 'transparent' : theme.colors.gray[3]
    }`,

    '&:disabled': {
      borderColor:
        theme.colorScheme === 'dark' ? 'transparent' : theme.colors.gray[3],
      opacity: 0.8,
      backgroundColor: 'transparent',
    },
  },

  input: {
    textAlign: 'center',
    paddingRight: `${theme.spacing.sm}px !important`,
    paddingLeft: `${theme.spacing.sm}px !important`,
    height: 28,
    flex: 1,
    width: 300,
    border: 'none',
  },
  button: {
    position: 'relative',
    width: 400,
    transition: 'background-color 150ms ease',
    margin: 10,
  },
}))

function Details() {
  const resolver = useYupValidationResolver(validationSchema)
  const { register, handleSubmit, formState } = useForm({ resolver })
  const [data, setData] = useState('')
  const { classes } = useStyles()
  return (
    <div className={styles.container}>
      <Head>
        <title>Details</title>
        <meta name="description" content="A simple Next.js/Input form." />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={styles.main}>
        <h1 className={styles.title}>Details Form</h1>
        <p className={styles.description}>
          Input your name, address and age to register
        </p>

        <form
          onSubmit={handleSubmit((data, error) => {
            const jsonData = JSON.stringify(data)
            setData(jsonData)
            console.log({ jsonData })
          })}
        >
          <TextInput
            label="FirstName"
            placeholder="Mark Anstead"
            classNames={classes}
            {...register('firstName')}
          />
          <p style={{ color: 'red' }}>{formState.errors?.firstName?.message}</p>
          <TextInput
            label="Address"
            placeholder="123 boston xyz street"
            classNames={classes}
            {...register('address')}
          />

          <p style={{ color: 'red' }}>{formState.errors?.address?.message}</p>
          <NumberInput
            variant="unstyled"
            label="Age"
            classNames={classes}
            {...register('age')}
          />
          <p style={{ color: 'red' }}>{formState.errors?.age?.message}</p>

          <Button
            fullWidth
            className={classes.button}
            type="submit"
            color={'teal'}
          >
            Submit
          </Button>
          <h4>{data}</h4>
          {console.log(formState.errors)}
        </form>
      </main>
    </div>
  )
}

export default Details
