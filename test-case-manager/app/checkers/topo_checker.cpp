// topo_checker.cpp
// Checker para problemas que pedem uma ordem topológica (qualquer ordem válida).
// Uso (via test runner / judge):
// topo_checker input_file correct_output_file participant_output_file
//
// Regras:
// - Lê n, m e m arestas do input (1-based vertices).
// - Lê do participante uma permutação de n inteiros (ou várias linhas, ignorando espaços).
// - Verifica que é permutação de 1..n e que para cada aresta u->v pos[u] < pos[v].
// - Se tudo OK -> quitf(_ok, "OK"); senão quitf(_wa, "...").

#include "testlib.h"
#include <bits/stdc++.h>
using namespace std;

int main(int argc, char** argv) {
    registerTestlibCmd(argc, argv);

    // Read problem input (inf)
    int n = inf.readInt();
    int m = inf.readInt();
    vector<pair<int,int>> edges;
    edges.reserve(m);
    for (int i = 0; i < m; ++i) {
        int u = inf.readInt();
        int v = inf.readInt();
        edges.emplace_back(u, v);
    }

    // Read participant's output (ouf)
    // We expect a permutation of length n (possibly with spaces/newlines).
    vector<int> perm;
    perm.reserve(n);
    // attempt to read n integers from participant output
    for (int i = 0; i < n; ++i) {
        if (ouf.is_eof()) {
            // Not enough integers
            quitf(_wa, "Participant output ended early: expected %d integers for permutation, got %d", n, (int)perm.size());
        }
        perm.push_back(ouf.readInt());
    }

    // Extra non-whitespace after reading permutation is OK (judge may ignore),
    // but if participant printed extra non-space tokens that look like integers, we could check them.
    // We'll tolerate trailing whitespace.

    // Validate it's a permutation of 1..n
    vector<char> seen(n + 1, 0);
    for (int i = 0; i < n; ++i) {
        int x = perm[i];
        if (x < 1 || x > n) {
            quitf(_wa, "Value out of range in permutation at position %d: %d (should be 1..%d)", i+1, x, n);
        }
        if (seen[x]) {
            quitf(_wa, "Duplicate value %d in permutation", x);
        }
        seen[x] = 1;
    }
    for (int v = 1; v <= n; ++v) {
        if (!seen[v]) quitf(_wa, "Missing value %d in permutation", v);
    }

    // Build position map
    vector<int> pos(n + 1, -1);
    for (int i = 0; i < n; ++i) pos[perm[i]] = i;

    // Check each edge u->v satisfies pos[u] < pos[v]
    for (int i = 0; i < m; ++i) {
        int u = edges[i].first;
        int v = edges[i].second;
        if (pos[u] >= pos[v]) {
            quitf(_wa, "Edge (%d -> %d) violates topological order: pos[%d]=%d >= pos[%d]=%d", u, v, u, pos[u], v, pos[v]);
        }
    }

    // Passed all checks
    quitf(_ok, "Valid topological order");
    return 0;
}
