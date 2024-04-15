/**
 * @jest-environment jsdom
 */

import "@testing-library/jest-dom";
import { screen, fireEvent, getByTestId, waitFor } from "@testing-library/dom";
import mockStore from "../__mocks__/store.js";
import NewBill from "../containers/NewBill.js";
import NewBillUI from "../views/NewBillUI.js";
import { ROUTES, ROUTES_PATH } from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import router from "../app/Router.js";
import Bills from "../containers/Bills.js";

jest.mock("../app/Store", () => mockStore);

 describe("When I am on NewBill Page", () => {
  // Configuration de l'environnement de test avant chaque test
 beforeEach(() => {
    Object.defineProperty(window, "localStorage", { value: localStorageMock });
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
  });

  test("Then mail icon on verticallayout should be highlighted", async () => {
    window.onNavigate(ROUTES_PATH.NewBill);
    await waitFor(() => screen.getByTestId("icon-mail"));
    const Icon = screen.getByTestId("icon-mail");
    expect(Icon).toHaveClass("active-icon");
  });

  describe ("When I am on NewBill form", () => {
    test("Then I add File", async () => {
      const dashboard = new NewBill({
        document,
        onNavigate,
        store: mockStore,
        localStorage: localStorageMock,
      });
  
      const handleChangeFile = jest.fn(dashboard.handleChangeFile);
      const inputFile = screen.getByTestId("file");
      inputFile.addEventListener("change", handleChangeFile);
      fireEvent.change(inputFile, {
        target: {
          files: [
            new File(["document.jpg"], "document.jpg", {
              type: "document/jpg",
            }),
          ],
        },
      });
  
      expect(handleChangeFile).toHaveBeenCalled();
      expect(handleChangeFile).toBeCalled();
      expect(screen.getByText("Envoyer une note de frais")).toBeTruthy();
    });
  })
});





describe("Given I am connected as an employee", () => {
  let newBill;
  beforeEach(() => {
    document.body.innerHTML = NewBillUI();
    Object.defineProperty(window, "localStorage", { value: localStorageMock }); // création du localstorage
    window.localStorage.setItem(
      "user",
      JSON.stringify({ type: "Employee", email: "toto@toto.fr" })
    );
    newBill = new NewBill({
      document,
      onNavigate: jest.fn(),
      store: mockStore,
      localStorage: window.localStorage,
    });
  });
  describe("When the file format is valid", () => {
    test("Then it should refrain from modifying the input field", () => {
      const handleChangeFile = jest.fn(newBill.handleChangeFile);
      const inputFile = screen.getByTestId("file");
      inputFile.addEventListener("change", handleChangeFile);
      fireEvent.change(inputFile, {
        target: {
          files: [
            new File(["mon_fichier.jpg"], "mon_fichier.jpg", {
              type: "image/jpg",
            }),
          ],
        },
      });
      expect(inputFile.files[0].name).toBe("mon_fichier.jpg");
      expect(handleChangeFile).toHaveBeenCalled();
    });
  });
  describe("If the file format is invalid", () => {
    test("Then It must refrain from modifying the input field", () => {
      const handleChangeFile = jest.fn(newBill.handleChangeFile);
      const inputFile = screen.getByTestId("file");
      inputFile.addEventListener("change", handleChangeFile);
      fireEvent.change(inputFile, {
        target: {
          files: [
            new File(["fichier.pdf"], "fichier.pdf", {
              type: "text/pdf",
            }),
          ],
        },
      });
      expect(handleChangeFile).toHaveReturnedWith(false);
    });
  });
});

// OFZ test d'intégration 3 POST new bill.  
describe("When I am on NewBill Page", () => {
  //Test d'intégration -> POST Ajouter Erreur 500
  test("integration test- new bill", async () => {
    localStorage.setItem(
      "user",
      JSON.stringify({
        type: "Employee",
        email: "a@a",
      })
    );
    const root = document.createElement("div");
    root.setAttribute("id", "root");
    document.body.append(root);
    router();
    window.onNavigate(ROUTES_PATH.NewBill);
    await waitFor(() => screen.getAllByText("Envoyer"));
  });
  describe("In the event of an API error", () => {
    test("Failed POST request for bill returns a 500 error message", async () => {
      try {
        jest.spyOn(mockStore, "bills");
        Object.defineProperty(window, "localStorage", {
          value: localStorageMock,
        });
        window.localStorage.setItem(
          "user",
          JSON.stringify({
            type: "Employee",
            email: "a@a",
            password: "employee",
            status: "connected",
          })
        );
        window.onNavigate(ROUTES_PATH.NewBill);
        const root = document.createElement("div");
        root.setAttribute("id", "root");
        document.body.appendChild(root);
        router();
        const buttonSubmit = screen.getAllByText("Envoyer");
        buttonSubmit[0].click();
        mockStore.bills.mockImplementationOnce(() => {
          return {
            create: (bill) => {
              return Promise.reject(new Error("Erreur 500"));
            },
          };
        });
        window.onNavigate(ROUTES_PATH.NewBill);
        await new Promise(process.nextTick);
        const message = screen.queryByText(/Erreur 500/);
        await waitFor(() => {
          expect(message).toBeTruthy();
        });
      } catch (error) {
        console.error(error);
      }
    });
  });
});