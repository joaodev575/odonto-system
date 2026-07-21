import "dotenv/config";
import bcrypt from "bcrypt";
import prisma from "./lib/prisma.js";

async function main() {
  console.log("Iniciando seed...");

  // Limpar dados existentes
  await prisma.consulta.deleteMany();
  await prisma.paciente.deleteMany();
  await prisma.doutor.deleteMany();
  await prisma.especialidade.deleteMany();
  await prisma.user.deleteMany();
  console.log("Dados antigos removidos");

  // Criar usuario admin
  const hashedPassword = await bcrypt.hash("Admin@123", 12);
  const admin = await prisma.user.create({
    data: {
      username: "admin",
      email: "admin@odonto.com",
      password: hashedPassword,
      role: "admin",
    },
  });
  console.log("Admin criado:", admin.username);

  // Criar especialidades
  const especialidades = await Promise.all([
    prisma.especialidade.create({ data: { nome: "Odontologia Geral", descricao: "Consultas e preventivos" } }),
    prisma.especialidade.create({ data: { nome: "Ortodontia", descricao: "Aparelhos e alinhadores" } }),
    prisma.especialidade.create({ data: { nome: "Endodontia", descricao: "Tratamento de canal" } }),
    prisma.especialidade.create({ data: { nome: "Periodontia", descricao: "Tratamento gengival" } }),
    prisma.especialidade.create({ data: { nome: "Implantodontia", descricao: "Implantes dentarios" } }),
  ]);
  console.log(`${especialidades.length} especialidades criadas`);

  // Criar doutores
  const doutores = await Promise.all([
    prisma.doutor.create({
      data: {
        nome: "Dr. Joao Pedro Santos",
        email: "joao.pedro.santos@odonto.com",
        telefone: "(11) 99999-1001",
        cpf: "111.222.333-01",
        codigoConselho: "CRO-10001",
        especialidadeId: especialidades[0].id,
      },
    }),
    prisma.doutor.create({
      data: {
        nome: "Dr. Joao Pedro Oliveira",
        email: "joao.pedro.oliveira@odonto.com",
        telefone: "(11) 99999-1002",
        cpf: "111.222.333-02",
        codigoConselho: "CRO-10002",
        especialidadeId: especialidades[1].id,
      },
    }),
    prisma.doutor.create({
      data: {
        nome: "Dr. Joao Pedro Lima",
        email: "joao.pedro.lima@odonto.com",
        telefone: "(11) 99999-1003",
        cpf: "111.222.333-03",
        codigoConselho: "CRO-10003",
        especialidadeId: especialidades[2].id,
      },
    }),
    prisma.doutor.create({
      data: {
        nome: "Dr. Joao Pedro Ferreira",
        email: "joao.pedro.ferreira@odonto.com",
        telefone: "(11) 99999-1004",
        cpf: "111.222.333-04",
        codigoConselho: "CRO-10004",
        especialidadeId: especialidades[3].id,
      },
    }),
    prisma.doutor.create({
      data: {
        nome: "Dr. Joao Pedro Costa",
        email: "joao.pedro.costa@odonto.com",
        telefone: "(11) 99999-1005",
        cpf: "111.222.333-05",
        codigoConselho: "CRO-10005",
        especialidadeId: especialidades[4].id,
      },
    }),
  ]);
  console.log(`${doutores.length} doutores criados`);

  // Criar pacientes
  const pacientes = await Promise.all([
    prisma.paciente.create({
      data: {
        nome: "Joao Pedro Silva",
        email: "joao.pedro@email.com",
        telefone: "(11) 88888-1001",
        cpf: "222.333.444-01",
        endereco: "Rua Augusta, 123 - Sao Paulo, SP",
        dataNascimento: new Date("1990-05-15"),
      },
    }),
    prisma.paciente.create({
      data: {
        nome: "Joao Pedro Almeida",
        email: "joao.pedro.almeida@email.com",
        telefone: "(11) 88888-1002",
        cpf: "222.333.444-02",
        endereco: "Av. Paulista, 456 - Sao Paulo, SP",
        dataNascimento: new Date("1985-08-22"),
      },
    }),
    prisma.paciente.create({
      data: {
        nome: "Joao Pedro Ribeiro",
        email: "joao.pedro.ribeiro@email.com",
        telefone: "(11) 88888-1003",
        cpf: "222.333.444-03",
        endereco: "Rua Oscar Freire, 789 - Sao Paulo, SP",
        dataNascimento: new Date("1978-12-10"),
        necessidadesEspeciais: "Cadeirante - necessita de acessibilidade",
      },
    }),
    prisma.paciente.create({
      data: {
        nome: "Joao Pedro Carvalho",
        email: "joao.pedro.carvalho@email.com",
        telefone: "(11) 88888-1004",
        cpf: "222.333.444-04",
        endereco: "Rua Haddock Lobo, 321 - Sao Paulo, SP",
        dataNascimento: new Date("1995-03-07"),
      },
    }),
    prisma.paciente.create({
      data: {
        nome: "Joao Pedro Gomes",
        email: "joao.pedro.gomes@email.com",
        telefone: "(11) 88888-1005",
        cpf: "222.333.444-05",
        endereco: "Rua Bela Cintra, 654 - Sao Paulo, SP",
        dataNascimento: new Date("1988-11-30"),
      },
    }),
    prisma.paciente.create({
      data: {
        nome: "Joao Pedro Martins",
        email: "joao.pedro.martins@email.com",
        telefone: "(11) 88888-1006",
        cpf: "222.333.444-06",
        endereco: "Rua Conselheiro Furtado, 987 - Sao Paulo, SP",
        dataNascimento: new Date("1992-07-18"),
      },
    }),
    prisma.paciente.create({
      data: {
        nome: "Joao Pedro Rodrigues",
        email: "joao.pedro.rodrigues@email.com",
        telefone: "(11) 88888-1007",
        cpf: "222.333.444-07",
        endereco: "Rua da Consolacao, 147 - Sao Paulo, SP",
        dataNascimento: new Date("1980-01-25"),
      },
    }),
    prisma.paciente.create({
      data: {
        nome: "Joao Pedro Nascimento",
        email: "joao.pedro.nascimento@email.com",
        telefone: "(11) 88888-1008",
        cpf: "222.333.444-08",
        endereco: "Rua Pamplona, 258 - Sao Paulo, SP",
        dataNascimento: new Date("1997-09-12"),
      },
    }),
    prisma.paciente.create({
      data: {
        nome: "Joao Pedro Barbosa",
        email: "joao.pedro.barbosa@email.com",
        telefone: "(11) 88888-1009",
        cpf: "222.333.444-09",
        endereco: "Rua Frei Caneca, 369 - Sao Paulo, SP",
        dataNascimento: new Date("1983-06-05"),
      },
    }),
    prisma.paciente.create({
      data: {
        nome: "Joao Pedro Fernandes",
        email: "joao.pedro.fernandes@email.com",
        telefone: "(11) 88888-1010",
        cpf: "222.333.444-10",
        endereco: "Rua Caio Prado, 741 - Sao Paulo, SP",
        dataNascimento: new Date("1991-04-20"),
      },
    }),
  ]);
  console.log(`${pacientes.length} pacientes criados`);

  // Criar consultas
  const hoje = new Date();
  const amanha = new Date(hoje.getTime() + 86400000);
  const proximaSemana = new Date(hoje.getTime() + 7 * 86400000);

  const consultas = await Promise.all([
    prisma.consulta.create({
      data: {
        pacienteId: pacientes[0].id,
        doutorId: doutores[0].id,
        data: hoje,
        horario: "09:00",
        status: "concluida",
        descricao: "Limpeza e check-up geral",
        valor: 150,
      },
    }),
    prisma.consulta.create({
      data: {
        pacienteId: pacientes[1].id,
        doutorId: doutores[1].id,
        data: hoje,
        horario: "10:30",
        status: "agendada",
        descricao: "Avaliacao ortodontica",
        valor: 200,
      },
    }),
    prisma.consulta.create({
      data: {
        pacienteId: pacientes[2].id,
        doutorId: doutores[2].id,
        data: hoje,
        horario: "14:00",
        status: "agendada",
        descricao: "Tratamento de canal",
        valor: 500,
        queixaPrincipal: "Dor intensa no dente 36",
        alergias: "Penicilina",
        medicamentos: "Ibuprofeno 600mg",
      },
    }),
    prisma.consulta.create({
      data: {
        pacienteId: pacientes[3].id,
        doutorId: doutores[0].id,
        data: amanha,
        horario: "09:00",
        status: "agendada",
        descricao: "Restauracao dentaria",
        valor: 250,
      },
    }),
    prisma.consulta.create({
      data: {
        pacienteId: pacientes[4].id,
        doutorId: doutores[3].id,
        data: amanha,
        horario: "11:00",
        status: "agendada",
        descricao: "Tratamento periodontal",
        valor: 350,
      },
    }),
    prisma.consulta.create({
      data: {
        pacienteId: pacientes[5].id,
        doutorId: doutores[4].id,
        data: proximaSemana,
        horario: "08:00",
        status: "agendada",
        descricao: "Avaliacao para implante",
        valor: 300,
      },
    }),
    prisma.consulta.create({
      data: {
        pacienteId: pacientes[6].id,
        doutorId: doutores[1].id,
        data: proximaSemana,
        horario: "10:00",
        status: "agendada",
        descricao: "Manutencao de aparelho",
        valor: 180,
      },
    }),
  ]);
  console.log(`${consultas.length} consultas criadas`);

  console.log("Seed concluido com sucesso!");
}

main()
  .catch((e) => {
    console.error("Erro no seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
