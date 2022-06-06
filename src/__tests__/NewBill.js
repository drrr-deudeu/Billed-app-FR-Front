/**
 * @jest-environment jsdom
 */

import { screen } from "@testing-library/dom"
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import { ROUTES_PATH } from "../constants/routes.js";
import {localStorageMock} from "../__mocks__/localStorage.js";
import router from "../app/Router.js";
import mockedBills from "../__mocks__/store.js"
import userEvent from "@testing-library/user-event";
//import { shallow, mount } from 'enzyme';

describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    test("Then disconnect button exists", () => {
      const html = NewBillUI()
      document.body.innerHTML = html
      //to-do write assertion
      expect(screen.getAllByTestId('layout-disconnect')).toBeDefined()
    })
  })
  describe("When I am on the NewBill page ", () => {
    test("I can submit the form", () => {
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)

      router()
      window.onNavigate(ROUTES_PATH.NewBill)
      const html = NewBillUI()
      document.body.innerHTML = html
      const newBill = new NewBill({ document, onNavigate, store:mockedBills, localStorage })
      // From https://stackoverflow.com/questions/41702911/how-can-i-test-a-change-handler-for-a-file-type-input-in-react-using-jest-enzyme
      const fileContents       = 'file contents';
      const file = new Blob([fileContents], {type : 'text/plain'});
      const readAsText         = jest.fn();
      const addEventListener   = jest.fn((_, evtHandler) => { evtHandler(); });
          // WARNING: But read the comment by Drenai for a potentially serious
          // problem with the above test of `addEventListener`.
      const dummyFileReader    = {addEventListener, readAsText, result: fileContents};
      window.FileReader        = jest.fn(() => dummyFileReader);
      //$('input[data-testid="file"]').simulate('change', {target: {files: [file]}});
      const fileElt = document.querySelector(`input[data-testid="file"]`)
      console.log("FileElt:"+fileElt.value)
      const handleSubmit = jest.fn((e) => {newBill.handleSubmit})
      const btnSubmit = document.getElementById('btn-send-bill')
      btnSubmit.addEventListener('click',handleSubmit)
      userEvent.click(btnSubmit)
      expect(handleSubmit).toHaveBeenCalled()
    })
  })
})
