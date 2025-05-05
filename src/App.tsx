
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Страницы
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

// Клиенты
import ClientsPage from "./pages/clients/ClientsPage";
import ClientForm from "./pages/clients/ClientForm";

// Продажи
import SalesPage from "./pages/sales/SalesPage";
import SaleForm from "./pages/sales/SaleForm";

// Задачи
import TasksPage from "./pages/tasks/TasksPage";
import TaskForm from "./pages/tasks/TaskForm";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          
          {/* Маршруты для клиентов */}
          <Route path="/clients" element={<ClientsPage />} />
          <Route path="/clients/new" element={<ClientForm />} />
          <Route path="/clients/:id" element={<ClientForm />} />
          <Route path="/clients/:id/edit" element={<ClientForm />} />
          
          {/* Маршруты для продаж */}
          <Route path="/sales" element={<SalesPage />} />
          <Route path="/sales/new" element={<SaleForm />} />
          <Route path="/sales/:id" element={<SaleForm />} />
          <Route path="/sales/:id/edit" element={<SaleForm />} />
          
          {/* Маршруты для задач */}
          <Route path="/tasks" element={<TasksPage />} />
          <Route path="/tasks/new" element={<TaskForm />} />
          <Route path="/tasks/:id" element={<TaskForm />} />
          <Route path="/tasks/:id/edit" element={<TaskForm />} />
          
          {/* Маршрут "страница не найдена" */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
