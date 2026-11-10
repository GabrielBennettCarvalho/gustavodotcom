/* ===== EXAME 1 DE 2022/23 (14 de novembro de 2022): o que faltava =====
   The information gain question rebuilds the class counts from the official solution, hence "(adaptado)". */
const X23_NN_TXT = 'Rede com W[1] = [[1, 1, 1], [1, 2, 1], [1, 1, 0,4]], b[1] = (0, 1, 0), W[2] = [[2, 1, 1], [1, 1, 1]], b[2] = (0,2; 0), f(z) = 0,4z + 0,6 (para z > 0) em todas as unidades, erro ½Σ(x[2] − t)², x[0] = (0, 1, 0), t = (0, 1).';

STUDY.questions('ml', [
{ id: 'x23-ig', t: 'exam', l: 3, les: 'dt-gain', card: 2, calc: true, src: 'Exame 1 2022/23, II.2.a (adaptado)',
  q: 'Classe binária com 8 exemplos N e 6 P. O atributo y₁ divide-os em A: 4 N e 2 P; B: 1 N e 3 P; C: 3 N e 1 P. Qual é o ganho de informação de y₁?',
  o: ['≈ 0,128', '≈ 0,857', '≈ 0,985', '≈ −0,128'], a: 0,
  e: 'H(classe) = −(8/14)log₂(8/14) − (6/14)log₂(6/14) = 0,985. H(classe|y₁) = (6/14)·0,918 + (4/14)·0,811 + (4/14)·0,811 = 0,857. IG = 0,985 − 0,857 = **0,128**.',
  w: { 1: '0,857 é a entropia condicional H(classe|y₁).', 2: '0,985 é a entropia da classe antes de dividir.', 3: 'O ganho nunca é negativo.' } },
{ id: 'x23-lg', t: 'exam', l: 4, les: 'lg-sig', card: 2, calc: true, src: 'Exame 1 2022/23, III.1',
  q: 'Regressão logística com entropia cruzada, x₁ = (0, −1) com t = 0, x₂ = (2, 2) com t = 1, x₃ = (1, 1) com t = 1. Todos os pesos começam a 1 (bias incluído) e η = 1. Quais são os pesos depois de uma atualização batch?',
  o: ['(0,55; 1,06; 1,56)', '(0,88; 1,00; 1,13)', '(1,45; 0,94; 0,44)', '(0,50; 1,00; 1,50)'], a: 0,
  e: 'wᵀx = 0, 5 e 3 → σ = 0,5; 0,993; 0,953. w ← w + ηΣ(t − σ)x = (1, 1, 1) − 0,5·(1, 0, −1) + 0,007·(1, 2, 2) + 0,047·(1, 1, 1) ≈ **(0,55; 1,06; 1,56)**. Fronteira: 0,55 + 1,06y₁ + 1,56y₂ = 0.',
  w: { 1: 'Isso é com erro quadrático, que multiplica por σ(1 − σ) e dá passos mais pequenos.', 2: 'Sinal trocado: subiu o erro.', 3: 'Isso só conta o exemplo x₁ e esquece x₂ e x₃.' } },
{ id: 'x23-nn-1', t: 'exam', l: 3, les: 'm-fwd', card: 1, calc: true, ch: 'x23-nn', step: '1/2', src: 'Exame 1 2022/23, III.2',
  q: X23_NN_TXT + '\nFaz a forward propagation. Quanto vale a saída x[2]?',
  o: ['(2,6; 2,12)', '(5; 3,8)', '(2,2; 1,82)', '(1; 1,8)'], a: 0,
  e: 'z[1] = W[1]x[0] + b[1] = (1, 3, 1), x[1] = 0,4z + 0,6 = (1; 1,8; 1). z[2] = W[2]x[1] + b[2] = (5; 3,8), x[2] = (0,4·5 + 0,6; 0,4·3,8 + 0,6) = **(2,6; 2,12)**.',
  w: { 1: 'Isso é z[2], antes da ativação.', 3: 'Isso é x[1], a camada escondida.' } },
{ id: 'x23-nn-2', t: 'exam', l: 4, les: 'm-bp', card: 2, calc: true, ch: 'x23-nn', step: '2/2', src: 'Exame 1 2022/23, III.2',
  q: X23_NN_TXT + '\nA forward dá x[1] = (1; 1,8; 1) e x[2] = (2,6; 2,12). Com um passo de descida do gradiente estocástica e η = 1, como fica a 1.ª linha de W[2]?',
  o: ['(0,96; −0,872; −0,04)', '(0,96; −2,12; −0,04)', '(−0,6; −3,68; −1,6)', '(3,04; 2,872; 2,04)'], a: 0,
  e: 'f′ = 0,4. δ[2] = (x[2] − t)·0,4 = (1,04; 0,448). W[2] ← W[2] − δ[2](x[1])ᵀ. 1.ª linha: (2, 1, 1) − 1,04·(1; 1,8; 1) = **(0,96; −0,872; −0,04)**. b[2] passa a (−0,84; −0,448).',
  w: { 1: 'Usaste z[1] = (1, 3, 1) em vez de x[1].', 2: 'Faltou multiplicar por f′ = 0,4.', 3: 'Sinal trocado: somaste o gradiente.' } },
]);
