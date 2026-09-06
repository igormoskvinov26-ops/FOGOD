# -*- coding: utf-8 -*-
"""STEP -> треугольная сетка (.npz), с разбивкой по телам сборки."""
import sys, time
import numpy as np
from OCP.STEPControl import STEPControl_Reader
from OCP.IFSelect import IFSelect_RetDone
from OCP.BRepMesh import BRepMesh_IncrementalMesh
from OCP.TopExp import TopExp_Explorer
from OCP.TopAbs import TopAbs_FACE, TopAbs_SOLID
from OCP.TopoDS import TopoDS
from OCP.BRep import BRep_Tool
from OCP.TopLoc import TopLoc_Location


def faces_of(shape):
    ex = TopExp_Explorer(shape, TopAbs_FACE)
    while ex.More():
        yield TopoDS.Face(ex.Current())
        ex.Next()


def solids_of(shape):
    ex = TopExp_Explorer(shape, TopAbs_SOLID)
    while ex.More():
        yield ex.Current()
        ex.Next()


def tris_of(face):
    loc = TopLoc_Location()
    tri = BRep_Tool.Triangulation_s(face, loc)
    if tri is None:
        return None
    trsf = loc.Transformation()
    n = tri.NbNodes()
    P = np.empty((n, 3))
    for i in range(1, n + 1):
        p = tri.Node(i).Transformed(trsf)
        P[i - 1] = (p.X(), p.Y(), p.Z())
    m = tri.NbTriangles()
    T = np.empty((m, 3), np.int64)
    for i in range(1, m + 1):
        a, b, c = tri.Triangle(i).Get()
        T[i - 1] = (a - 1, b - 1, c - 1)
    if face.Orientation() == 1:            # TopAbs_REVERSED
        T = T[:, ::-1]
    return P[T]


def main(path, out, defl=3.0):
    t0 = time.time()
    rd = STEPControl_Reader()
    assert rd.ReadFile(path) == IFSelect_RetDone, 'STEP не читается'
    rd.TransferRoots()
    sh = rd.OneShape()
    BRepMesh_IncrementalMesh(sh, defl, False, 0.6, True)
    print('тесселяция: %.1f с' % (time.time() - t0), flush=True)

    chunks, sizes = [], []
    for sol in solids_of(sh):
        acc = []
        for f in faces_of(sol):
            t = tris_of(f)
            if t is not None:
                acc.append(t)
        if not acc:
            continue
        A = np.concatenate(acc)
        chunks.append(A)
        V = A.reshape(-1, 3)
        sizes.append(float(np.linalg.norm(V.max(0) - V.min(0))))

    if not chunks:
        acc = [t for f in faces_of(sh) if (t := tris_of(f)) is not None]
        chunks, sizes = [np.concatenate(acc)], [1e9]

    tris = np.concatenate(chunks).astype(np.float32)
    gid = np.concatenate([np.full(len(c), i, np.int32) for i, c in enumerate(chunks)])
    np.savez_compressed(out, tris=tris, gid=gid, sizes=np.array(sizes, np.float32))
    V = tris.reshape(-1, 3)
    print('тел: %d | треугольников: %d | габарит мм: %s | %.1f с'
          % (len(chunks), len(tris),
             ' x '.join('%.0f' % v for v in (V.max(0) - V.min(0))),
             time.time() - t0), flush=True)


if __name__ == '__main__':
    main(sys.argv[1], sys.argv[2], float(sys.argv[3]) if len(sys.argv) > 3 else 3.0)
