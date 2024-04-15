/**
 * @jest-environment jsdom
 */

import {screen, waitFor} from "@testing-library/dom";
import BillsUI from "../views/BillsUI.js";
import Bills from "../containers/Bills.js";
import { bills } from "../fixtures/bills.js";
import { ROUTES, ROUTES_PATH } from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store";
import router from "../app/Router.js";
import userEvent from "@testing-library/user-event";
import $ from 'jquery';
import { fireEvent } from '@testing-library/dom';

jest.mock("../app/store", () => mockStore);

//Configuration initiale : Avant chaque test, nous mettons en place un environnement simulé qui ressemble à celui de l'application réelle. Cela inclut des éléments comme le stockage local (localStorage) et la création d'un élément div simulé qui servira de point d'ancrage pour notre application.
describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => {
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
        })
      );
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);
      router();
      window.onNavigate(ROUTES_PATH.Bills);

      await waitFor(() => screen.getByTestId("icon-window"));
      const windowIcon = screen.getByTestId("icon-window");
      // OFZ (test unitaire 1) ajout “expect” Bills 
      expect(windowIcon.classList.contains("active-icon")).toBe(true);
    });

    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills })
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
      const chrono = (a, b) => ((a < b) ? 1 : -1) // Méthode de tri pour l'ordre croissant
      const datesSorted = [...dates].sort(chrono) // Tri des dates dans l'ordre croissant
      expect(dates).toEqual(datesSorted)
    })
  });

 

  describe("When employee click on new bill", () => {
    test("Then form should be displayed", () => {
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };

      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
        })
      );

      const billsDashboard = new Bills({
        document,
        onNavigate,
        store: null,
        bills: bills,
        localStorage: window.localStorage,
      });

      const newBillBtn = screen.getByTestId("btn-new-bill");
      const handleClickNewBill = jest.fn(billsDashboard.handleClickNewBill);

      newBillBtn.addEventListener("click", handleClickNewBill);
      userEvent.click(newBillBtn);

      expect(handleClickNewBill).toHaveBeenCalled();
      expect(screen.getByText("Envoyer une note de frais")).toBeTruthy();
      expect(screen.getByTestId("form-new-bill")).toBeTruthy();
    });
  });
});

/* OFZ  test d'intégration 2 GET Bills */

describe("When Employee Navigate on Bills Dashbord", () => {
  beforeEach(() => {
    jest.spyOn(mockStore, "bills");
    Object.defineProperty(window, "localStorage", {
      value: localStorageMock,
    });
    window.localStorage.setItem(
      "user",
      JSON.stringify({
        type: "Employee",
        email: "a@a",
      })
    );
    const root = document.createElement("div");
    root.setAttribute("id", "root");
    document.body.appendChild(root);
    router();
  });

  test("fetches bills from an API and fails with 404 message error", async () => {
    mockStore.bills.mockImplementationOnce(() => {
      return {
        list: () => {
          return Promise.reject(new Error("Erreur 404"));
        },
      };
    });
    window.onNavigate(ROUTES_PATH.Bills);
    await new Promise(process.nextTick);
    const message = await screen.getByText(/Erreur 404/);
    expect(message).toBeTruthy();
  });

  test("fetches messages from an API and fails with 500 message error", async () => {
    mockStore.bills.mockImplementationOnce(() => {
      return {
        list: () => {
          return Promise.reject(new Error("Erreur 500"));
        },
      };
    });

    window.onNavigate(ROUTES_PATH.Bills);
    await new Promise(process.nextTick);
    const message = await screen.getByText(/Erreur 500/);
    expect(message).toBeTruthy();
  });

  test("fetches bills from an API", async () => {
    const bills = await mockStore.bills().list();
    expect(bills.length).toBe(4);
  });
});

describe('When employee clicks on eye button', () => {
  test('Then modal should be displayed', () => {
    // Créez un élément factice représentant l'icône de l'œil
    const icon = document.createElement('div');
    icon.setAttribute('data-bill-url', 'example.com/bill');
    
    // Créez une instance de la classe Bills
    const bills = new Bills({
      document,
      onNavigate: jest.fn(), // Utilisez jest.fn() pour créer une fonction espionne
      store: null, // Vous pouvez utiliser un magasin fictif ou un mock ici
      localStorage: localStorageMock, // Assurez-vous de fournir une implémentation de localStorage pour la classe
    });

    // Appelez directement la méthode handleClickIconEye avec l'icône factice en tant qu'argument
    bills.handleClickIconEye(icon);

    // Vérifiez si la méthode modal('show') a été appelée sur l'élément avec l'ID modaleFile
    expect($('#modaleFile').find(".modal-body").html()).toContain('<img width=');
  });
});
