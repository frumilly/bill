/**
 * @jest-environment jsdom
 */

import {screen, waitFor} from "@testing-library/dom"
import BillsUI from "../views/BillsUI.js"
import { bills } from "../fixtures/bills.js"
import { ROUTES_PATH} from "../constants/routes.js";
import {localStorageMock} from "../__mocks__/localStorage.js";

import router from "../app/Router.js";

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
      // compare le résultat réel de l'exécution du code avec le résultat attendu et signale une erreur si les deux ne correspondent pas.
      expect(windowIcon).toHaveClass('active-icon')
    })
    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills })
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
      const chrono = (a, b) => ((a < b) ? 1 : -1) // Méthode de tri pour l'ordre croissant
      const datesSorted = [...dates].sort(chrono) // Tri des dates dans l'ordre croissant
      expect(dates).toEqual(datesSorted)
    })
    
  })
})

// test d'intégration GET Bills
test("Integration test for GET Bills", async () => {

  // When: Exécution de l'action ici je vais faire appel à la fonctionnalité GET Bills
  const response = await fetch("/api/bills"); // Supposons que l'API pour récupérer les factures se trouve à l'URL /api/bills
  const bills = await response.json(); 

  // Then: ici Vérification du résultat
  expect(response.status).toBe(200); // Vérifie que la réponse est réussie
  expect(bills).toHaveLength(3); // Vérifie que trois factures sont retournées, par exemple (on peut choisir un autre cas)

});
