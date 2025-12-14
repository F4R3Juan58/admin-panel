import React from 'react';
import { createWebApi, newRequestId, ActionType, ActionRequestPayloads, PlayerSummary, BanEntry, ChatMessage, AdminAction } from '@api';
import {
  AppLayout,
  Sidebar,
  Topbar,
  Card,
  StatWidget,
  SectionTitle,
  ActionGrid,
  Table,
  Badge,
  Button,
  Modal,
  ToastStack,
  Tabs,
  FormGroup,
  Input,
  Textarea,
  ChatList,
  LogList,
  MetricRow,
  VirtualList,
  PageGrid,
} from '@ui';

const api = createWebApi('web');

type Toast = { id: string; message: string; tone?: 'success' | 'error' | 'info' };

type ViewKey = 'actions' | 'players' | 'stats' | 'bans' | 'chat' | 'logs';

const useAsync = <T,>(fn: () => Promise<T>, deps: React.DependencyList) => {
  const [data, setData] = React.useState<T | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    setLoading(true);
    fn()
      .then((res) => setData(res))
      .catch((err) => setError(err?.message ?? 'Error'))
      .finally(() => setLoading(false));
  }, deps);

  return { data, loading, error, refetch: () => fn().then(setData) } as const;
};

const ActionsView: React.FC<{ onExecute: (type: ActionType, payload: ActionRequestPayloads[ActionType]) => void }> = ({ onExecute }) => {
  const [confirm, setConfirm] = React.useState<{ type: ActionType; payload: ActionRequestPayloads[ActionType]; label: string } | null>(null);

  const openConfirm = (type: ActionType, payload: ActionRequestPayloads[ActionType], label: string) => setConfirm({ type, payload, label });

  const actions = [
    { key: ActionType.ADMIN_TAG, title: 'Etiqueta admin', description: 'Toggle de tag visual', handler: () => openConfirm(ActionType.ADMIN_TAG, { enabled: true }, 'Activar etiqueta') },
    { key: ActionType.PLAYER_NAMES, title: 'Nombres de jugadores', description: 'Mostrar u ocultar nombres', handler: () => openConfirm(ActionType.PLAYER_NAMES, { enabled: true }, 'Mostrar nombres') },
    { key: ActionType.PLAYER_SKELETON, title: 'Esqueleto jugador', description: 'Rayos X propio', handler: () => openConfirm(ActionType.PLAYER_SKELETON, { enabled: true }, 'Activar esqueleto') },
    { key: ActionType.ANNOUNCE, title: 'Anunciar', description: 'Mensaje global', handler: () => openConfirm(ActionType.ANNOUNCE, { message: 'Reinicio en 10 minutos' }, 'Enviar anuncio') },
    { key: ActionType.REVIVE_ALL, title: 'Revivir a todos', description: 'Acción global', handler: () => openConfirm(ActionType.REVIVE_ALL, {}, 'Revivir a todos'), dangerous: true },
    { key: ActionType.CLEAR_NEARBY, title: 'Eliminar cercano', description: 'Limpiar entidades', handler: () => openConfirm(ActionType.CLEAR_NEARBY, { radius: 30 }, 'Limpiar'), dangerous: true },
    { key: ActionType.NOCLIP, title: 'Noclip', description: 'Moverse libremente', handler: () => openConfirm(ActionType.NOCLIP, { enabled: true }, 'Activar noclip') },
    { key: ActionType.GODMODE_SELF, title: 'Modo Dios', description: 'Invulnerable', handler: () => openConfirm(ActionType.GODMODE_SELF, { enabled: true }, 'Activar modo dios') },
    { key: ActionType.OBJECT_MODE, title: 'Modo objeto', description: 'Mover como objeto', handler: () => openConfirm(ActionType.OBJECT_MODE, { enabled: true }, 'Activar modo objeto') },
  ];

  return (
    <>
      <SectionTitle title="Acciones rápidas" description="Todas las acciones pasan por la cola server-side" />
      <ActionGrid
        actions={actions.map((a) => ({ key: a.key, title: a.title, description: a.description, onClick: a.handler, dangerous: a.dangerous }))}
      />
      <Modal
        title={confirm?.label ?? ''}
        open={!!confirm}
        onClose={() => setConfirm(null)}
        onConfirm={() => {
          if (!confirm) return;
          onExecute(confirm.type, confirm.payload);
          setConfirm(null);
        }}
      >
        Confirma la ejecución de la acción {confirm?.type}.
      </Modal>
    </>
  );
};

const PlayersView: React.FC<{ players: PlayerSummary[]; onAction: (type: ActionType, payload: ActionRequestPayloads[ActionType]) => void }> = ({ players, onAction }) => {
  const [selected, setSelected] = React.useState<string | null>(null);
  const [search, setSearch] = React.useState('');

  const filtered = players.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()) || p.citizenId.toLowerCase().includes(search.toLowerCase()) || p.id.includes(search));

  const actionsForPlayer = (playerId: string) => [
    { key: 'revive', label: 'Revivir', onClick: () => onAction(ActionType.REVIVE, { targetId: playerId }) },
    { key: 'heal', label: 'Curar', onClick: () => onAction(ActionType.HEAL, { targetId: playerId }) },
    { key: 'kill', label: 'Matar', onClick: () => onAction(ActionType.KILL, { targetId: playerId }), dangerous: true },
    { key: 'vehicle', label: 'Dar vehículo', onClick: () => onAction(ActionType.SPAWN_VEHICLE, { model: 'police', plate: 'ADMIN' }) },
    { key: 'freeze', label: 'Congelar', onClick: () => onAction(ActionType.FREEZE, { targetId: playerId, enabled: true }) },
    { key: 'ban', label: 'Banear', onClick: () => onAction(ActionType.BAN, { targetId: playerId, reason: 'Razón', expiresAt: null }), dangerous: true },
  ];

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
      <Card title="Jugadores en vivo" actions={<Input placeholder="Buscar" value={search} onChange={(e) => setSearch(e.target.value)} />}
        className="xl:col-span-2">
        <VirtualList
          items={filtered}
          itemHeight={72}
          height={520}
          render={(player) => (
            <div
              className="flex items-center justify-between py-3 px-3 border-b border-slate-800 hover:bg-slate-800/50 cursor-pointer"
              onClick={() => setSelected(player.id)}
            >
              <div>
                <p className="font-semibold text-slate-100">{player.name}</p>
                <p className="text-xs text-slate-500">{player.citizenId} · {player.job}</p>
              </div>
              <Badge label={`Ping ${player.ping ?? 0}`} color="yellow" />
            </div>
          )}
        />
      </Card>
      <Card title="Acciones del jugador" className="xl:col-span-1">
        {selected ? (
          <div className="space-y-2">
            <p className="text-sm text-slate-400">Jugador seleccionado: {selected}</p>
            <div className="grid grid-cols-2 gap-2">
              {actionsForPlayer(selected).map((action) => (
                <Button key={action.key} variant={action.dangerous ? 'danger' : 'ghost'} onClick={action.onClick}>
                  {action.label}
                </Button>
              ))}
            </div>
          </div>
        ) : (
          <p className="text-sm text-slate-500">Selecciona un jugador de la lista.</p>
        )}
      </Card>
    </div>
  );
};

const BansView: React.FC<{ bans: BanEntry[]; onUnban: (banId: number) => void }> = ({ bans, onUnban }) => (
  <Card title="Baneos">
    <Table
      columns={['ID', 'Ciudadano', 'Razón', 'Staff', 'Expira', 'Estado', 'Acciones']}
      rows={bans.map((ban) => [
        ban.id,
        ban.citizenId ?? ban.identifier ?? 'N/A',
        ban.reason,
        ban.bannedBy,
        ban.expiresAt ?? 'Permanent',
        <Badge key={`b-${ban.id}`} label={ban.active ? 'Activo' : 'Inactivo'} color={ban.active ? 'red' : 'default'} />, (
          <Button key={`u-${ban.id}`} size="sm" variant="ghost" onClick={() => onUnban(ban.id)}>
            Unban
          </Button>
        ),
      ])}
    />
  </Card>
);

const ChatView: React.FC<{ messages: ChatMessage[]; onSend: (content: string) => void }> = ({ messages, onSend }) => {
  const [text, setText] = React.useState('');
  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
      <Card title="Chat de administradores" className="xl:col-span-2">
        <ChatList messages={messages} />
      </Card>
      <Card title="Enviar mensaje">
        <FormGroup label="Mensaje">
          <Textarea rows={5} value={text} onChange={(e) => setText(e.target.value)} placeholder="Mensaje para administradores" />
        </FormGroup>
        <Button className="mt-3" onClick={() => { onSend(text); setText(''); }}>
          Enviar
        </Button>
      </Card>
    </div>
  );
};

const StatsView: React.FC<{ stats: { players: number; bankTotal: number; cashTotal: number; actionsTotal: number; ramUsageMb?: number; cpuUsage?: number } }> = ({ stats }) => (
  <PageGrid>
    <div className="xl:col-span-2 space-y-4">
      <SectionTitle title="KPIs" description="Métricas rápidas del servidor" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatWidget label="Jugadores" value={stats.players} />
        <StatWidget label="Banco total" value={`$${stats.bankTotal.toLocaleString()}`} />
        <StatWidget label="Efectivo total" value={`$${stats.cashTotal.toLocaleString()}`} />
        <StatWidget label="Acciones" value={stats.actionsTotal} />
      </div>
      <Card title="Salud del servidor">
        <MetricRow label="RAM" value={`${stats.ramUsageMb ?? 'N/A'} MB`} accent />
        <MetricRow label="CPU" value={`${stats.cpuUsage ?? 'N/A'} %`} accent />
      </Card>
    </div>
    <Card title="Notas de worker">
      <p className="text-sm text-slate-400">
        El worker reclama acciones en cola cada 500ms. Todas las solicitudes desde web o NUI se insertan como PENDING y se ejecutan server-side.
      </p>
    </Card>
  </PageGrid>
);

const LogsView: React.FC<{ logs: AdminAction[] }> = ({ logs }) => (
  <Card title="Logs de acciones">
    <LogList logs={logs.map((l) => ({ id: l.id, actionType: l.actionType, actorName: l.actorName, status: l.status, createdAt: l.createdAt }))} />
  </Card>
);

const App: React.FC = () => {
  const [view, setView] = React.useState<ViewKey>('actions');
  const [toasts, setToasts] = React.useState<Toast[]>([]);

  const { data: players = [] } = useAsync(() => api.getPlayersLive(), []);
  const { data: bans = [], refetch: refetchBans } = useAsync(() => api.getBans(), []);
  const { data: stats = { players: 0, bankTotal: 0, cashTotal: 0, actionsTotal: 0 } } = useAsync(() => api.getServerStats(), []);
  const { data: logs = [] } = useAsync(() => api.getLogs(), []);
  const { data: chat = [], refetch: refetchChat } = useAsync(() => api.getChatMessages(), []);

  const pushToast = (message: string, tone: Toast['tone'] = 'info') => setToasts((t) => [...t, { id: crypto.randomUUID(), message, tone }]);

  const executeAction = async (actionType: ActionType, payload: ActionRequestPayloads[ActionType]) => {
    pushToast('Acción encolada', 'info');
    try {
      await api.executeAction({ actionType, payload, requestId: newRequestId(), source: 'WEB' });
      pushToast('Acción enviada al worker', 'success');
    } catch (err) {
      pushToast('Error al enviar acción', 'error');
      console.error(err);
    }
  };

  const unban = async (banId: number) => {
    await executeAction(ActionType.UNBAN, { banId });
    refetchBans();
  };

  const sendChat = async (message: string) => {
    if (!message) return;
    await api.postChatMessage(message);
    refetchChat();
    pushToast('Mensaje enviado', 'success');
  };

  const sidebarLinks = [
    { key: 'actions', label: 'Acciones', icon: '⚡' },
    { key: 'players', label: 'Jugadores', icon: '👥' },
    { key: 'stats', label: 'Estadísticas', icon: '📊' },
    { key: 'bans', label: 'Baneos', icon: '⛔' },
    { key: 'chat', label: 'Chat', icon: '💬' },
    { key: 'logs', label: 'Logs', icon: '📜' },
  ];

  const renderView = () => {
    switch (view) {
      case 'actions':
        return <ActionsView onExecute={executeAction} />;
      case 'players':
        return <PlayersView players={players} onAction={executeAction} />;
      case 'stats':
        return <StatsView stats={stats} />;
      case 'bans':
        return <BansView bans={bans} onUnban={unban} />;
      case 'chat':
        return <ChatView messages={chat as ChatMessage[]} onSend={sendChat} />;
      case 'logs':
        return <LogsView logs={logs} />;
      default:
        return null;
    }
  };

  return (
    <AppLayout
      sidebar={<Sidebar links={sidebarLinks} active={view} onNavigate={(key) => setView(key as ViewKey)} />}
      topbar={<Topbar placeholder="Buscar acciones" actions={<Tabs tabs={sidebarLinks.map(({ key, label }) => ({ key, label }))} active={view} onChange={(k) => setView(k as ViewKey)} />} />}
    >
      {renderView()}
      <ToastStack toasts={toasts} />
    </AppLayout>
  );
};

export default App;
