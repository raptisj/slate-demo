import React, { useCallback, useMemo, useState } from "react";
import { Editable, withReact, useSlate, Slate } from "slate-react";
import { Editor, Transforms, createEditor } from "slate";
import { withHistory } from "slate-history";

import { Button, Icon, Toolbar } from "./Ui";

const LIST_TYPES = ["numbered-list", "bulleted-list", "quote-list"];

const RichTextExample = () => {
  const [value, setValue] = useState(initialValue);
  const renderElement = useCallback((props) => <Element {...props} />, []);
  const renderLeaf = useCallback((props) => <Leaf {...props} />, []);
  const editor = useMemo(() => withHistory(withReact(createEditor())), []);

  return (
    <Slate editor={editor} value={value} onChange={(value) => setValue(value)}>
      <Toolbar>
        <BlockButton format="quote-list" icon="blockquote-bullet-list" />
        <BlockButton format="block-quote" icon="normal-blockquote-quote" />
        <BlockButton format="bulleted-list" icon="plain-bullet-list" />
      </Toolbar>
      <Editable
        renderElement={renderElement}
        renderLeaf={renderLeaf}
        placeholder="Enter some rich text…"
        spellCheck
        autoFocus
      />
    </Slate>
  );
};

const toggleBlock = (editor, format) => {
  const isActive = isBlockActive(editor, format);
  const isList = LIST_TYPES.includes(format);

  Transforms.unwrapNodes(editor, {
    match: (n) => LIST_TYPES.includes(n.type),
    split: true,
  });

  Transforms.setNodes(editor, {
    type: isActive ? "paragraph" : isList ? "list-item" : format,
  });

  if (!isActive && isList) {
    const block = { type: format, children: [] };
    Transforms.wrapNodes(editor, block);
  }
};

const isBlockActive = (editor, format) => {
  const [match] = Editor.nodes(editor, {
    match: (n) => n.type === format,
  });

  return !!match;
};

const Element = ({ attributes, children, element }) => {
  switch (element.type) {
    case "quote-list":
      return (
        <blockquote {...attributes}>
          <ul>{children}</ul>
        </blockquote>
      );

    case "block-quote":
      return <blockquote {...attributes}>{children}</blockquote>;

    case "bulleted-list":
      return <ul {...attributes}>{children}</ul>;

    case "list-item":
      return <li {...attributes}>{children}</li>;

    default:
      return <p {...attributes}>{children}</p>;
  }
};

const Leaf = ({ attributes, children, leaf }) => {
  if (leaf.bold) {
    children = <strong>{children}</strong>;
  }

  if (leaf.code) {
    children = <code>{children}</code>;
  }

  if (leaf.italic) {
    children = <em>{children}</em>;
  }

  if (leaf.underline) {
    children = <u>{children}</u>;
  }

  return <span {...attributes}>{children}</span>;
};

const BlockButton = ({ format, icon }) => {
  const editor = useSlate();
  return (
    <Button
      active={isBlockActive(editor, format)}
      onMouseDown={(event) => {
        event.preventDefault();
        toggleBlock(editor, format);
      }}
    >
      <Icon>{icon}</Icon>
    </Button>
  );
};

const initialValue = [
  {
    type: "block-quote",
    children: [{ text: "Standard block quote!!!!" }],
  },

  {
    type: "quote-list",
    children: [
      {
        type: "list-item",
        children: [{ text: "Bullet list item in block quote" }],
      },
      {
        type: "list-item",
        children: [{ text: "Bullet list item in block quote" }],
      },
    ],
  },
];

export default RichTextExample;
