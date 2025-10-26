"use client";

import { Box, Button, Group, TextInput, Textarea } from "@mantine/core";
import { DateTimePicker } from "@mantine/dates";
import { useForm } from "@mantine/form";

export default function ClientForm() {
  const form = useForm({
    initialValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      datetime: new Date(),
      message: "",
    },

    validate: {
      firstName: (value) =>
        value.trim().length < 2 ? "Eesnimi liiga lühike" : null,
      lastName: (value) =>
        value.trim().length < 2 ? "Perekonnanimi liiga lühike" : null,
      email: (value) =>
        /^\S+@\S+$/.test(value) ? null : "Vigane e-posti aadress",
      phone: (value) =>
        /^[+]?[0-9\s-]{6,}$/.test(value)
          ? null
          : "Sisesta kehtiv telefoni number",
      message: (value) =>
        value.length > 200 ? "Tekst ei tohi olla üle 200 tähemärgi" : null,
    },
  });

  const handleSubmit = (values: typeof form.values) => {
    console.log("Vormi andmed:", values);
    alert(`Aitäh, ${values.firstName}! Vormi andmed on konsoolis.`);
  };

  return (
    <Box maw={420} mx="auto" mt="xl">
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <TextInput
          required
          label="Eesnimi"
          placeholder="Sisesta eesnimi"
          {...form.getInputProps("firstName")}
          mb="sm"
        />
        <TextInput
          required
          label="Perekonnanimi"
          placeholder="Sisesta perekonnanimi"
          {...form.getInputProps("lastName")}
          mb="sm"
        />
        <TextInput
          required
          label="E-mail"
          placeholder="nimi@example.com"
          {...form.getInputProps("email")}
          mb="sm"
        />
        <TextInput
          required
          label="Telefoni number"
          placeholder="+372 5555 5555"
          {...form.getInputProps("phone")}
          mb="sm"
        />
        <DateTimePicker
          label="Kuupäev ja kellaaeg"
          placeholder="Vali aeg"
          {...form.getInputProps("datetime")}
          mb="sm"
        />
        <Textarea
          label="Tekst"
          placeholder="Lisa tekst..."
          autosize
          minRows={3}
          {...form.getInputProps("message")}
          mb="md"
        />

        <Group justify="center" mt="md">
          <Button type="submit">Saada</Button>
        </Group>
      </form>
    </Box>
  );
}
