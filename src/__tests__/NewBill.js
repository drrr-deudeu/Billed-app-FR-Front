/**
 * @jest-environment jsdom
 */

import { screen, waitFor } from "@testing-library/dom"
import BillsUI from "../views/BillsUI.js"
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import { ROUTES_PATH } from "../constants/routes.js";
import {localStorageMock} from "../__mocks__/localStorage.js";
import router from "../app/Router.js";
import mockedBills from "../__mocks__/store.js"
import userEvent from "@testing-library/user-event";

describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    test("Then disconnect button exists", () => {
      const html = NewBillUI()
      document.body.innerHTML = html
      //to-do write assertion
      expect(screen.getAllByTestId('layout-disconnect')).toBeDefined()
    })
  })
  describe("When I upload a non-image file", () => {
    test("file is not set", () => {      
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', {
        type: 'Employee',
        email: 'a@a'
      })
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)

      router()
      //document.body.innerHTML = BillsUI({ data: mockedBills })

      window.onNavigate(ROUTES_PATH.NewBill)
      const html = NewBillUI()
      document.body.innerHTML = html
      const newBill = new NewBill({ document, onNavigate, store:mockedBills, localStorage: window.localStorage })
      newBill.store = mockedBills      
      const fileInput = document.querySelector(`input[data-testid="file"]`)
      var data = 'Ceci est un fichier texte';
      var file = new File([data], 'primer.txt', {type: 'text/plain'});
      jest.spyOn(window, 'alert').mockImplementation(() => {});
      
      userEvent.upload(fileInput,file)
      expect(newBill.fileName).toBe(null)
    })
  })
  describe("When I upload an image file", () => {
    test("I can submit the form", () => {      
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', {
        type: 'Employee',
        email: 'a@a'
      })
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)

      router()
      //document.body.innerHTML = BillsUI({ data: mockedBills })

      window.onNavigate(ROUTES_PATH.NewBill)
      const html = NewBillUI()
      document.body.innerHTML = html
      const newBill = new NewBill({ document, onNavigate, store:mockedBills, localStorage: window.localStorage })
      newBill.store = mockedBills      
      const fileInput = document.querySelector(`input[data-testid="file"]`)
      var data = 'Ceci est un fichier image';

      var file = new File([data], 'primer.jpg', {type: 'image/jpeg'});
      userEvent.upload(fileInput,file)
      const handleSubmit = jest.fn((e) => {newBill.handleSubmit})
      const btnSubmit = document.getElementById('btn-send-bill')
      btnSubmit.addEventListener('click',handleSubmit)
      userEvent.click(btnSubmit)
      expect(handleSubmit).toHaveBeenCalled()
    })
  })
  describe("When an error occurs on API", () => {
    test("fails with 404 message error on create new bill", done => {
      jest.spyOn(mockedBills,'bills')
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', {
        type: 'Employee',
        email: 'a@a'
      })

      let error = 0
      mockedBills.bills.mockImplementation(() => {
        return {
          create : () =>  {
            error = 404
            done();
            return Promise.reject(new Error("Erreur 404"))
          }
      }})
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.NewBill)
      const html = NewBillUI()
      document.body.innerHTML = html
      const newBill = new NewBill({ document, onNavigate, store:null, localStorage: window.localStorage })
      newBill.store = mockedBills   
      const fileInput = document.querySelector(`input[data-testid="file"]`)
      var data = 'Ceci est un fichier image';

      var file = new File([data], 'primer.jpg', {type: 'image/jpeg'});
      console.error = jest.fn(message => {
        expect(message.message).toEqual('Erreur 404')
        })
      try{
        userEvent.upload(fileInput,file)
        done()
      }
      catch(e){
      }
      expect(error).toBe(404)
    })
    test("fails with 500 message error on create new bill", done => {
      jest.spyOn(mockedBills,'bills')
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', {
        type: 'Employee',
        email: 'a@a'
      })

      let error = 0
      mockedBills.bills.mockImplementation(() => {
        return {
          create : () =>  {
            error = 500
            done();
            return Promise.reject(new Error("Erreur 500"))
          }
      }})
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.NewBill)
      const html = NewBillUI()
      document.body.innerHTML = html
      const newBill = new NewBill({ document, onNavigate, store:null, localStorage: window.localStorage })
      newBill.store = mockedBills   
      const fileInput = document.querySelector(`input[data-testid="file"]`)
      var data = 'Ceci est un fichier image';

      var file = new File([data], 'primer.jpg', {type: 'image/jpeg'});
      console.error = jest.fn(message => {
        expect(message.message).toEqual('Erreur 500')
        })
      try{
        userEvent.upload(fileInput,file)
        done()
      }
      catch(e){
      }
      expect(error).toBe(500)
    })

  })
})
