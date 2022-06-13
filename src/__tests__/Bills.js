/**
 * @jest-environment jsdom
 */

import {screen, waitFor} from "@testing-library/dom"
import userEvent from "@testing-library/user-event";
import { ROUTES, ROUTES_PATH } from "../constants/routes"
import { localStorageMock } from "../__mocks__/localStorage.js"
import mockStore from "../__mocks__/store"
import { bills } from "../fixtures/bills"
import router from "../app/Router"

import BillsUI from "../views/BillsUI.js"
import Bills from "../containers/Bills"
jest.mock("../app/Store", () => mockStore)

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
      const billsObj = new Bills({ document, onNavigate, mockStore, localStorage })
      const handleNewBill = jest.fn((e) => billsObj.handleClickNewBill())
      const iconNewBill = screen.getByTestId('btn-new-bill')
      iconNewBill.addEventListener('click',handleNewBill)
      userEvent.click(iconNewBill)
      expect(handleNewBill).toHaveBeenCalled()
    })
    test("Then bill eye button should exist", () => {
      const iconsEye = screen.getAllByTestId('icon-eye')
      expect(iconsEye.length).toEqual(4)
      const billsObj = new Bills({ document, onNavigate, mockStore, localStorage })
      const handleShowTicket1 = jest.fn((e) => billsObj.handleClickIconEye(iconsEye[0]))
      iconsEye[0].addEventListener('click', handleShowTicket1)
      userEvent.click(iconsEye[0])
      expect(handleShowTicket1).toHaveBeenCalled()
    })
    test("Then click on New Bill : New Bill page", () => {
      document.body.innerHTML = BillsUI({ data: bills })
      const billsObj = new Bills({ document, onNavigate, mockStore, localStorage })
      billsObj.store = ""
      expect(billsObj.getBills()).toBeUndefined()
      billsObj.store = mockStore
      expect(billsObj.getBills()).toBeDefined()
    })
  })
  describe("When an error occurs on API", () => {
    beforeEach(() => {
      jest.spyOn(mockStore, "bills")
      Object.defineProperty(
          window,
          'localStorage',
          { value: localStorageMock }
      )
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee',
        email: "a@a"
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.appendChild(root)
      router()
    })

    test("fails with 404 message error on create new bill", async () => {
      mockStore.bills.mockImplementationOnce(() => {
        return {
          list : () =>  {
            return Promise.reject(new Error("Erreur 404"))
          }
        }})
      window.onNavigate(ROUTES_PATH.Bills)
      await new Promise(process.nextTick);
      const message = await screen.getByText(/Erreur 404/)
      expect(message).toBeTruthy()

    })
    test("fails with 500 message error on create new bill", async () => {
      mockStore.bills.mockImplementationOnce(() => {
        return {
          list : () =>  {
            return Promise.reject(new Error("Erreur 500"))
          }
        }})
      window.onNavigate(ROUTES_PATH.Bills)
      await new Promise(process.nextTick);
      const message = await screen.getByText(/Erreur 500/)
      expect(message).toBeTruthy()
    })
  })
})

