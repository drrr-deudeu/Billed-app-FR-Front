/**
 * @jest-environment jsdom
 */

import {screen, waitFor} from "@testing-library/dom"
import BillsUI from "../views/BillsUI.js"
import { bills } from "../fixtures/bills.js"
import { ROUTES_PATH } from "../constants/routes.js";
import {localStorageMock} from "../__mocks__/localStorage.js";

import router from "../app/Router.js";
import userEvent from "@testing-library/user-event";

import Bills from "../containers/Bills"

import mockedBills from "../__mocks__/store.js"

import NewBill from '../containers/NewBill';

jest.mock('../containers/NewBill'); // NewBill est maintenant un constructeur simulé


describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => {

      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      await waitFor(() => screen.getByTestId('icon-window'))
      const windowIcon = screen.getByTestId('icon-window')
      //to-do write expect expression
      expect(windowIcon).toBeDefined()
    })
    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills })
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
      const antiChrono = (a, b) => ((a < b) ? 1 : -1)
      const datesSorted = [...dates].sort(antiChrono)
      expect(dates).toEqual(datesSorted)
    })
    test("Then New bill button should exist", () => {
      // document.body.innerHTML = BillsUI({ data: bills })
      expect(screen.getByTestId('btn-new-bill')).toBeDefined()
    })
    test("Then click on New Bill : New Bill page", () => {
      document.body.innerHTML = BillsUI({ data: bills })
      const billsObj = new Bills({ document, onNavigate, mockedBills, localStorage })
      const handleNewBill = jest.fn((e) => billsObj.handleClickNewBill())
      const iconNewBill = screen.getByTestId('btn-new-bill')
      iconNewBill.addEventListener('click',handleNewBill)
      userEvent.click(iconNewBill)
      expect(handleNewBill).toHaveBeenCalled()
    })
    test("Then bill eye button should exist", () => {
      const iconsEye = screen.getAllByTestId('icon-eye')
      expect(iconsEye.length).toEqual(4)
      const billsObj = new Bills({ document, onNavigate, mockedBills, localStorage })
      const handleShowTicket1 = jest.fn((e) => billsObj.handleClickIconEye(iconsEye[0]))
      iconsEye[0].addEventListener('click', handleShowTicket1)
      userEvent.click(iconsEye[0])
      expect(handleShowTicket1).toHaveBeenCalled()
    })
    test("Then click on New Bill : New Bill page", () => {
      document.body.innerHTML = BillsUI({ data: bills })
      const billsObj = new Bills({ document, onNavigate, mockedBills, localStorage })
      billsObj.store = ""
      expect(billsObj.getBills()).toBeUndefined()
      billsObj.store = mockedBills
      expect(billsObj.getBills()).toBeDefined()
    })
  })
})
