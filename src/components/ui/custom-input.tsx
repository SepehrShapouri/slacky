import React from "react";
import { FormControl, FormField, FormItem, FormMessage } from "./form";
import { Input } from "./input";
import { FieldValue } from "react-hook-form";
type CustomInputProps = {
  name: string;
  placeholder: string;
  control: FieldValue<any>;
  type: React.HTMLInputTypeAttribute;
  disabled?: boolean;
};
function CustomInput({
  control,
  name,
  placeholder,
  type,
  disabled,
}: CustomInputProps) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormControl>
            <Input
              disabled={disabled}
              type={type}
              {...field}
              placeholder={placeholder}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

export default CustomInput;
