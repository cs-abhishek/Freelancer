"use client";

import { useState } from "react";

import { FieldError } from "@/components/forms/field-error";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

/**
 * Skills are a `String[]` in the database and the Server Action reads them with
 * `formData.getAll("skills")`. The visible field is a comma-separated string, so
 * each parsed skill is mirrored into a hidden input on every keystroke.
 */
export function SkillsInput({
  id = "skills",
  label = "Skills",
  placeholder = "React, Node.js, Figma",
  errors,
}: {
  id?: string;
  label?: string;
  placeholder?: string;
  errors?: string[];
}) {
  const [value, setValue] = useState("");
  const skills = value
    .split(",")
    .map((skill) => skill.trim())
    .filter(Boolean);

  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder={placeholder}
        autoComplete="off"
      />
      {skills.map((skill, index) => (
        // Positional key on purpose: the list is rebuilt from the raw string.
        <input key={`${skill}-${index}`} type="hidden" name="skills" value={skill} />
      ))}
      <FieldError messages={errors} />
    </div>
  );
}
