#include "testlib.h"
#include <bits/stdc++.h>

using namespace std;

int main(int argc, char* argv[]) {
    registerGen(argc, argv, 1);

    // Leitura do parâmetro 'n' da linha de comando.
    int n = opt<int>("n");

    // Imprime o número de nós.
    cout << n << endl;

    // Se n for 1, não há arestas.
    if (n == 1) {
        return 0;
    }

    // Vetor para armazenar as arestas geradas.
    vector<pair<int, int>> edges;

    // Gera uma permutação aleatória dos nós de 1 a n.
    vector<int> p(n);
    for (int i = 0; i < n; ++i) {
        p[i] = i + 1;
    }
    shuffle(p.begin(), p.end());

    // Gera uma árvore aleatória conectando cada nó a um nó anterior na permutação.
    // Isso garante n-1 arestas e conectividade.
    for (int i = 1; i < n; ++i) {
        int u = p[i];
        int v = p[rnd.next(i)]; // Conecta p[i] a um p[j] aleatório com j < i.
        edges.push_back({u, v});
    }

    // Embaralha as arestas para que a ordem de impressão seja aleatória.
    shuffle(edges.begin(), edges.end());

    // Imprime as n-1 arestas.
    for (const auto& edge : edges) {
        // Imprime os nós da aresta em ordem aleatória (u, v) ou (v, u).
        if (rnd.next(2)) {
            cout << edge.first << " " << edge.second << endl;
        } else {
            cout << edge.second << " " << edge.first << endl;
        }
    }

    return 0;
}
/* COMMANDS:
./gen -n 1
./gen -n 2
./gen -n 3
./gen -n 4
./gen -n 5
./gen -n 6
./gen -n 7
./gen -n 8
./gen -n 9
./gen -n 10
./gen -n 10
./gen -n 10
./gen -n 9
./gen -n 8
./gen -n 7
./gen -n 6
./gen -n 5
./gen -n 4
./gen -n 3
./gen -n 2
*/