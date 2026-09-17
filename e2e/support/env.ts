import { resolve } from "node:path"

/**
 * Variables d'environnement optionnelles utilisées par les tests E2E.
 *
 * Aucune d'entre elles n'est requise pour exécuter la suite : les tests qui en
 * dépendent sont ignorés (skipped) proprement lorsqu'elles sont absentes.
 *
 * - E2E_BASE_URL        : URL de l'application (défaut : http://127.0.0.1:3000)
 * - E2E_TEST_EMAIL      : e-mail d'un compte de test sur l'environnement Supabase DEV
 * - E2E_TEST_PASSWORD   : mot de passe de ce compte DEV
 * - E2E_TEST_ORG_ID     : UUID d'une organisation DEV appartenant au compte de test
 * - E2E_RUN_MUTATIONS   : "1" permet les tests qui écrivent des données DEV
 *                         (modification de profil, création d'organisation)
 */

export const E2E_BASE_URL = process.env.E2E_BASE_URL ?? "http://localhost:3000"
export const E2E_TEST_EMAIL = process.env.E2E_TEST_EMAIL
export const E2E_TEST_PASSWORD = process.env.E2E_TEST_PASSWORD
export const E2E_TEST_ORG_ID = process.env.E2E_TEST_ORG_ID
export const E2E_RUN_MUTATIONS = ["1", "true", "yes"].includes(
  (process.env.E2E_RUN_MUTATIONS ?? "").toLowerCase(),
)

export const hasCredentials = Boolean(E2E_TEST_EMAIL && E2E_TEST_PASSWORD)
export const hasTestOrganization = Boolean(E2E_TEST_ORG_ID)

export const STORAGE_STATE_PATH = resolve(process.cwd(), "e2e/.auth/user.json")

export const SKIP_NO_CREDENTIALS =
  "Ignore : variables E2E_TEST_EMAIL / E2E_TEST_PASSWORD absentes (compte DEV requis)."
export const SKIP_NO_ORG =
  "Ignore : variable E2E_TEST_ORG_ID absente (organisation DEV requise)."
export const SKIP_NO_MUTATIONS =
  "Ignore : variable E2E_RUN_MUTATIONS absente (test en écriture DEV désactivé)."