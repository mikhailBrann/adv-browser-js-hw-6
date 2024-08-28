import { JSDOM } from "jsdom";
import { jest, test, expect, describe, beforeEach } from "@jest/globals";
import MyTrello from "../MyTrello";

const dom = new JSDOM("<!DOCTYPE html><html><body></body></html>");
global.document = dom.window.document;
global.window = dom.window;

Object.defineProperty(window, "localStorage", {
  value: {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
  },
});

describe("MyTrello", () => {
  let myTrello;
  let parentElem;

  beforeEach(() => {
    parentElem = document.createElement("div");
    parentElem.classList.add(".Trello");
    document.body.appendChild(parentElem);
    myTrello = new MyTrello(parentElem);
  });

  test("constructor", async () => {
    expect(myTrello).toBeDefined();
    expect(myTrello.parentElem).toBe(parentElem);
    expect(myTrello.draggedElem).toBeUndefined();
    expect(myTrello.cordinates).toEqual({ x: 0, y: 0 });
    expect(myTrello.draggedElemСursorOffset).toEqual({ x: 0, y: 0 });
    expect(myTrello.draggedElemWidth).toEqual(false);
    expect(myTrello.descState).toEqual({ columns: [] });
  });
});
