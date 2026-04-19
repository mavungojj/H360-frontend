import { useState, useEffect } from "react";
import api from "../services/api";

interface Subscription {
  id: number;
  plan: string;
  status: string;
  startDate: string;
  endDate: string;
}

const plans = [
  {
    id: "basic",
    name: "Basico",
    price: "15.000 Kz/mes",
    features: [
      "Ate 100 pacientes",
      "1 utilizador",
      "Consultas e exames",
      "Suporte por email",
    ],
  },
  {
    id: "pro",
    name: "Profissional",
    price: "45.000 Kz/mes",
    features: [
      "Ate 1000 pacientes",
      "5 utilizadores",
      "Consultas e exames",
      "Notificacoes SMS",
      "Suporte prioritario",
    ],
  },
  {
    id: "enterprise",
    name: "Empresarial",
    price: "120.000 Kz/mes",
    features: [
      "Pacientes ilimitados",
      "Utilizadores ilimitados",
      "Todas as funcionalidades",
      "IA para diagnosticos",
      "Suporte 24/7",
    ],
  },
];

export default function SubscriptionPage() {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState(false);

  useEffect(() => {
    loadSubscription();
  }, []);

  async function loadSubscription() {
    try {
      const res = await api.get("/subscriptions/my");
      setSubscription(res.data);
    } catch {
      setSubscription(null);
    } finally {
      setLoading(false);
    }
  }

  async function handleSelectPlan(planId: string) {
    setUpgrading(true);
    try {
      if (subscription) {
        await api.put("/subscriptions", { plan: planId });
      } else {
        await api.post("/subscriptions", { plan: planId });
      }
      await loadSubscription();
    } finally {
      setUpgrading(false);
    }
  }

  async function handleCancel() {
    if (!confirm("Tens a certeza que queres cancelar?")) return;
    await api.put("/subscriptions", { status: "cancelled" });
    loadSubscription();
  }

  if (loading) return <div className="p-6 text-gray-500">A carregar...</div>;

  const isActive = subscription?.status === "active";

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-2">Subscricao</h2>
      <p className="text-gray-500 mb-8">Gere o teu plano</p>

      {isActive && subscription && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8 flex justify-between items-center">
          <div>
            <p className="text-sm text-gray-500 mb-1">Plano atual</p>
            <p className="text-xl font-bold text-gray-800 capitalize">
              {subscription.plan}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Ativo desde{" "}
              {new Date(subscription.startDate).toLocaleDateString("pt-PT")}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-700">
              Ativa
            </span>
            <button
              onClick={handleCancel}
              className="text-sm text-red-500 hover:text-red-700"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        {isActive ? "Mudar de plano" : "Escolhe um plano"}
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => {
          const isCurrent = subscription?.plan === plan.id && isActive;
          return (
            <div
              key={plan.id}
              className={`bg-white rounded-xl border-2 p-6 flex flex-col ${
                isCurrent ? "border-blue-500" : "border-gray-200"
              }`}
            >
              <p className="text-lg font-bold text-gray-800 mb-1">
                {plan.name}
              </p>
              <p className="text-2xl font-bold text-blue-600 mb-4">
                {plan.price}
              </p>
              <ul className="space-y-2 mb-6 flex-1">
                {plan.features.map((f, i) => (
                  <li key={i} className="text-sm text-gray-600">
                    + {f}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => handleSelectPlan(plan.id)}
                disabled={isCurrent || upgrading}
                className={`w-full py-2 rounded-lg text-sm font-medium transition ${
                  isCurrent
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                }`}
              >
                {isCurrent
                  ? "Plano atual"
                  : upgrading
                  ? "A processar..."
                  : "Escolher " + plan.name}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}