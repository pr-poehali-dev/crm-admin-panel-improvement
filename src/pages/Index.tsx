
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Icon from "@/components/ui/icon";
import { SidebarProvider, Sidebar, SidebarHeader, SidebarContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";

const Dashboard = () => {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Клиенты</CardTitle>
          <Icon name="Users" className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">243</div>
          <p className="text-xs text-muted-foreground">+12% с прошлого месяца</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Продажи</CardTitle>
          <Icon name="CreditCard" className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">₽12,234</div>
          <p className="text-xs text-muted-foreground">+7% с прошлого месяца</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Задачи</CardTitle>
          <Icon name="CheckSquare" className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">16</div>
          <p className="text-xs text-muted-foreground">3 новых задачи сегодня</p>
        </CardContent>
      </Card>
    </div>
  );
};

const Index = () => {
  const navigate = useNavigate();

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full bg-background">
        <Sidebar>
          <SidebarHeader>
            <div className="flex items-center px-2">
              <Icon name="Boxes" className="mr-2 h-6 w-6" />
              <div className="text-lg font-bold">CRM Система</div>
              <div className="ml-auto">
                <SidebarTrigger />
              </div>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton 
                  isActive={true} 
                  tooltip="Дашборд" 
                  onClick={() => navigate("/")}
                >
                  <Icon name="LayoutDashboard" />
                  <span>Дашборд</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton 
                  tooltip="Клиенты" 
                  onClick={() => navigate("/clients")}
                >
                  <Icon name="Users" />
                  <span>Клиенты</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton 
                  tooltip="Продажи"
                  onClick={() => navigate("/sales")}
                >
                  <Icon name="CreditCard" />
                  <span>Продажи</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton 
                  tooltip="Задачи"
                  onClick={() => navigate("/tasks")}
                >
                  <Icon name="CheckSquare" />
                  <span>Задачи</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton 
                  tooltip="Отчеты"
                  onClick={() => navigate("/reports")}
                >
                  <Icon name="BarChart" />
                  <span>Отчеты</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton 
                  tooltip="Настройки"
                  onClick={() => navigate("/settings")}
                >
                  <Icon name="Settings" />
                  <span>Настройки</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>
        </Sidebar>
        <SidebarInset>
          <header className="border-b">
            <div className="flex h-16 items-center px-4">
              <div className="ml-auto flex items-center space-x-4">
                <Button variant="ghost" size="icon">
                  <Icon name="Bell" className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon">
                  <Icon name="User" className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </header>
          <main className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-bold tracking-tight">Дашборд</h2>
              <div className="flex items-center space-x-2">
                <Button>
                  <Icon name="Download" className="mr-2 h-4 w-4" />
                  Скачать отчет
                </Button>
              </div>
            </div>
            <Dashboard />
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default Index;
