# Projeto-ENG-II

Nome do aplicativo: ?

## PROJETO PRELIMINAR

### Diagrama de casos de uso

@startuml
left to right direction

actor "Usuário / Motorista" as Usuario
actor "Serviço de Localização / GPS" as GPS
actor "Serviço de Mapas / Geolocalização" as Mapas

rectangle "Sistema de Monitoramento de Entregadores" {

    usecase "Cadastrar / Editar\nDados do Veículo" as UC01
    usecase "Configurar Parâmetros\nde Custo" as UC02

    usecase "Iniciar Jornada" as UC03
    usecase "Encerrar Jornada" as UC04

    usecase "Monitorar Localização" as UC05
    usecase "Registrar Rota" as UC06
    usecase "Identificar Parada" as UC07
    usecase "Calcular Tempo Parado" as UC08
    usecase "Calcular Distância Percorrida" as UC09
    usecase "Calcular Custo do Combustível" as UC10
    usecase "Calcular Dinheiro Perdido" as UC11

    usecase "Consultar Dashboard" as UC12
    usecase "Visualizar Tempo Parado\npor Dia" as UC13
    usecase "Visualizar Tempo Parado\npor Mês" as UC14

    usecase "Consultar Histórico" as UC15
    usecase "Consultar Pontos de Parada" as UC16
    usecase "Consultar Tempo Parado\npor Endereço" as UC17
    usecase "Consultar Rotas" as UC18
}

Usuario --> UC01
Usuario --> UC02
Usuario --> UC03
Usuario --> UC04
Usuario --> UC12
Usuario --> UC15

GPS --> UC05
Mapas --> UC07

UC03 ..> UC05 : <<include>>
UC05 ..> UC06 : <<include>>
UC06 ..> UC07 : <<include>>
UC07 ..> UC08 : <<include>>
UC06 ..> UC09 : <<include>>

UC08 ..> UC11 : <<include>>
UC09 ..> UC10 : <<include>>
UC10 ..> UC11 : <<include>>

UC12 ..> UC13 : <<include>>
UC12 ..> UC14 : <<include>>

UC15 ..> UC16 : <<include>>
UC15 ..> UC17 : <<include>>
UC15 ..> UC18 : <<include>>

UC02 ..> UC10 : <<include>>

@enduml


### Diagrama de robustez 

@startuml
left to right direction

skinparam packageStyle rectangle

actor "Usuário / Motorista" as Usuario
actor "GPS" as GPS
actor "Serviço de Mapas" as Mapas

package "Fronteira (Boundary)" {

    boundary "Tela de Configuração" as TelaConfig
    boundary "Tela de Jornada" as TelaJornada
    boundary "Tela de Monitoramento" as TelaMonitoramento
    boundary "Tela de Dashboard" as TelaDashboard
    boundary "Tela de Histórico" as TelaHistorico
}

package "Controle (Control)" {

    control "Controle de Configuração" as CtrlConfig
    control "Controle de Jornada" as CtrlJornada
    control "Controle de Localização" as CtrlLocalizacao
    control "Controle de Paradas" as CtrlParadas
    control "Controle de Custos" as CtrlCustos
    control "Controle de Dashboard" as CtrlDashboard
    control "Controle de Histórico" as CtrlHistorico
}

package "Entidades (Entity)" {

    entity "Usuário" as UsuarioEnt
    entity "Veículo" as Veiculo
    entity "Parâmetros de Custo" as Parametros
    entity "Jornada" as Jornada
    entity "Rota" as Rota
    entity "Ponto de Localização" as Ponto
    entity "Parada" as Parada
    entity "Cálculo de Custo" as Calculo
}

Usuario --> TelaConfig
Usuario --> TelaJornada
Usuario --> TelaDashboard
Usuario --> TelaHistorico

GPS --> CtrlLocalizacao
Mapas --> CtrlParadas

TelaConfig --> CtrlConfig
CtrlConfig --> UsuarioEnt
CtrlConfig --> Veiculo
CtrlConfig --> Parametros

TelaJornada --> CtrlJornada
CtrlJornada --> Jornada

CtrlJornada --> CtrlLocalizacao
CtrlLocalizacao --> Ponto
CtrlLocalizacao --> Rota

CtrlLocalizacao --> CtrlParadas
CtrlParadas --> Parada
CtrlParadas --> CtrlLocalizacao

CtrlParadas --> CtrlCustos
CtrlCustos --> Parametros
CtrlCustos --> Veiculo
CtrlCustos --> Jornada
CtrlCustos --> Parada
CtrlCustos --> Calculo

TelaMonitoramento --> CtrlJornada
CtrlJornada --> CtrlLocalizacao

TelaDashboard --> CtrlDashboard
CtrlDashboard --> Jornada
CtrlDashboard --> Rota
CtrlDashboard --> Parada
CtrlDashboard --> Calculo

TelaHistorico --> CtrlHistorico
CtrlHistorico --> Jornada
CtrlHistorico --> Rota
CtrlHistorico --> Parada
CtrlHistorico --> Ponto

@enduml

### Diagrama de classes conceitual


@startuml

class Usuario {
    - id: int
    - nome: String
    - email: String
}

class Veiculo {
    - id: int
    - modelo: String
    - placa: String
    - consumoKmLitro: double
}

class ParametrosCusto {
    - id: int
    - valorCombustivel: double
    - kmPorLitro: double
    - valorPorKm: double
}

class Jornada {
    - id: int
    - data: Date
    - inicio: DateTime
    - fim: DateTime
    - duracao: Duration
    - jornadaPrevista: Duration
}

class Rota {
    - id: int
    - inicio: DateTime
    - fim: DateTime
    - distanciaKm: double
}

class PontoLocalizacao {
    - id: int
    - latitude: double
    - longitude: double
    - dataHora: DateTime
}

class Parada {
    - id: int
    - endereco: String
    - inicio: DateTime
    - fim: DateTime
    - duracao: Duration
}

class CalculoCusto {
    - id: int
    - distanciaPercorridaKm: double
    - combustivelConsumido: double
    - custoCombustivel: double
    - tempoParado: Duration
    - dinheiroPerdido: double
}

Usuario "1" -- "1..*" Jornada : realiza
Usuario "1" -- "1..*" Veiculo : utiliza
Veiculo "1" -- "1" ParametrosCusto : possui

Jornada "1" -- "1..*" Rota : possui
Jornada "1" -- "0..*" Parada : possui
Jornada "1" -- "1..*" PontoLocalizacao : registra
Jornada "1" -- "1" CalculoCusto : gera

Rota "1" -- "1..*" PontoLocalizacao : formada por
Parada "1" -- "1..*" PontoLocalizacao : identificada por

CalculoCusto "1" ..> ParametrosCusto : utiliza
CalculoCusto "1" ..> Veiculo : considera
CalculoCusto "1" ..> Parada : considera
CalculoCusto "1" ..> Rota : considera

@enduml
