import React from "react";
import { ComponentStory, ComponentMeta } from "@storybook/react";
import {NumInput} from "../components/NumInput/NumInput";

export default {
  title: "Example/NumInput",
  component: NumInput
} as ComponentMeta<typeof NumInput>;

const Template: ComponentStory<typeof NumInput> = (args) => (
  <NumInput {...args} />
);

export const HelloStory = Template.bind({});

HelloStory.args = {};
