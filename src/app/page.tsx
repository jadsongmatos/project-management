"use client";
import React, { useState, useRef } from "react";
import {
  Container,
  Typography,
  Box,
  TextField,
  Paper,
  AppBar,
  Toolbar,
  InputAdornment,
  Grid,
} from "@mui/material";

// Constantes configuráveis para dimensões do canvas
const TRIANGLE_X_MIN = 50;
const TRIANGLE_X_MAX = 250;
const TRIANGLE_Y_MIN = 50;
const TRIANGLE_Y_MAX = 200;
const CURVATURE = 2;

// Curva logística para relações não-lineares
const logistic = (x: number, k = CURVATURE) => {
  return 1 / (1 + Math.exp(-k * (x * 2 - 1) * 2));
};

// Ajuste exponencial para custo
const exponentialAdjustment = (x: number, k = CURVATURE) => {
  return (Math.exp(k * x) - 1) / (Math.exp(k) - 1);
};

const Home = () => {
  const [bac, setBac] = useState(6000);
  const [sac, setSac] = useState(12);
  const [pointPosition, setPointPosition] = useState({
    x: TRIANGLE_X_MIN + (TRIANGLE_X_MAX - TRIANGLE_X_MIN) / 2,
    y: TRIANGLE_Y_MIN + (TRIANGLE_Y_MAX - TRIANGLE_Y_MIN) / 2,
  });
  const [isDragging, setIsDragging] = useState(false);
  const triangleRef = useRef<SVGSVGElement>(null);

  const calculateValues = (x: number, y: number) => {
    const normalizedX = Math.max(
      0,
      Math.min(1, (x - TRIANGLE_X_MIN) / (TRIANGLE_X_MAX - TRIANGLE_X_MIN))
    );
    const normalizedY = Math.max(
      0,
      Math.min(1, 1 - (y - TRIANGLE_Y_MIN) / (TRIANGLE_Y_MAX - TRIANGLE_Y_MIN))
    );

    const quality = normalizedY * 100;
    if (quality <= 0) {
      return { quality: 0, cost: 0, time: 0 };
    }

    const adjustedX = logistic(normalizedX);
    const adjustedY = logistic(normalizedY);

    const baseCost = bac;
    const costAdjustment = exponentialAdjustment(adjustedX);
    const adjustedCost = baseCost * (1 + 1.5 * costAdjustment) * adjustedY;

    const baseTime = sac * 5;
    const timeAdjustment = exponentialAdjustment(1 - adjustedX);
    const adjustedTime = baseTime * (0.5 + 0.5 * timeAdjustment) * adjustedY;

    return {
      quality: Math.max(0, Math.min(100, quality)),
      cost: Math.round(adjustedCost * 100) / 100,
      time: Math.round(adjustedTime),
    };
  };

  const values = calculateValues(pointPosition.x, pointPosition.y);

  const handlePointerDown = (e: React.PointerEvent) => {
    const target = e.target as HTMLElement;
    if (target.tagName === "circle" && triangleRef.current) {
      const rect = triangleRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      if (isPointInTriangle(x, y)) {
        setIsDragging(true);
        setPointPosition({ x, y });
        target.setPointerCapture(e.pointerId); // Captura o ponteiro
      }
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (isDragging && triangleRef.current) {
      const rect = triangleRef.current.getBoundingClientRect();
      let x = e.clientX - rect.left;
      let y = e.clientY - rect.top;

      x = Math.max(TRIANGLE_X_MIN, Math.min(TRIANGLE_X_MAX, x));
      y = Math.max(TRIANGLE_Y_MIN, Math.min(TRIANGLE_Y_MAX, y));

      if (!isPointInTriangle(x, y)) {
        const closest = findClosestPointInTriangle(x, y);
        x = closest.x;
        y = closest.y;
      }

      setPointPosition({ x, y });
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    const target = e.target as HTMLElement;
    if (target.releasePointerCapture) {
      target.releasePointerCapture(e.pointerId); // Libera o ponteiro
    }
    setIsDragging(false);
  };

  // Funções auxiliares para cálculo geométrico
  const isPointInTriangle = (px: number, py: number) => {
    const ax = TRIANGLE_X_MIN,
      ay = TRIANGLE_Y_MAX;
    const bx = TRIANGLE_X_MAX,
      by = TRIANGLE_Y_MAX;
    const cx = (TRIANGLE_X_MIN + TRIANGLE_X_MAX) / 2,
      cy = TRIANGLE_Y_MIN;

    const v0x = cx - ax;
    const v0y = cy - ay;
    const v1x = bx - ax;
    const v1y = by - ay;
    const v2x = px - ax;
    const v2y = py - ay;

    const dot00 = v0x * v0x + v0y * v0y;
    const dot01 = v0x * v1x + v0y * v1y;
    const dot02 = v0x * v2x + v0y * v2y;
    const dot11 = v1x * v1x + v1y * v1y;
    const dot12 = v1x * v2x + v1y * v2y;

    const invDenom = 1 / (dot00 * dot11 - dot01 * dot01);
    const u = (dot11 * dot02 - dot01 * dot12) * invDenom;
    const v = (dot00 * dot12 - dot01 * dot02) * invDenom;

    return u >= 0 && v >= 0 && u + v <= 1;
  };

  const findClosestPointInTriangle = (px: number, py: number) => {
    const ax = TRIANGLE_X_MIN,
      ay = TRIANGLE_Y_MAX;
    const bx = TRIANGLE_X_MAX,
      by = TRIANGLE_Y_MAX;
    const cx = (TRIANGLE_X_MIN + TRIANGLE_X_MAX) / 2,
      cy = TRIANGLE_Y_MIN;

    const ab = closestPointOnLineSegment(
      px,
      py,
      { x: ax, y: ay },
      { x: bx, y: by }
    );
    const bc = closestPointOnLineSegment(
      px,
      py,
      { x: bx, y: by },
      { x: cx, y: cy }
    );
    const ca = closestPointOnLineSegment(
      px,
      py,
      { x: cx, y: cy },
      { x: ax, y: ay }
    );

    const d1 = distance(ab.x, ab.y, px, py);
    const d2 = distance(bc.x, bc.y, px, py);
    const d3 = distance(ca.x, ca.y, px, py);

    if (d1 <= d2 && d1 <= d3) return ab;
    else if (d2 <= d3) return bc;
    else return ca;
  };

  const closestPointOnLineSegment = (
    px: number,
    py: number,
    a: { x: number; y: number },
    b: { x: number; y: number }
  ) => {
    const ax = a.x,
      ay = a.y;
    const bx = b.x,
      by = b.y;

    const apx = px - ax;
    const apy = py - ay;
    const abx = bx - ax;
    const aby = by - ay;

    const dot = apx * abx + apy * aby;
    const lenSq = abx * abx + aby * aby;

    if (lenSq === 0) return { x: ax, y: ay };

    const param = dot / lenSq;
    const clampedParam = Math.max(0, Math.min(1, param));

    const x = ax + clampedParam * abx;
    const y = ay + clampedParam * aby;

    return { x, y };
  };

  const distance = (x1: number, y1: number, x2: number, y2: number) => {
    return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      {/* Header */}
      <AppBar position="static" color="primary">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Triângulo do Gerenciamento de Projetos
          </Typography>
          <Typography variant="subtitle1">
            Relação não-linear entre Custo, Prazo e Qualidade
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        {/* Inputs */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <TextField
            fullWidth
            label="Budget at Completion (BAC)"
            type="number"
            value={bac}
            onChange={(e) => setBac(parseFloat(e.target.value))}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">R$</InputAdornment>
              ),
            }}
            variant="outlined"
          />
          <TextField
            fullWidth
            label="Schedule at Completion (SAC)"
            type="number"
            value={sac}
            onChange={(e) => setSac(parseFloat(e.target.value))}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">semanas</InputAdornment>
              ),
            }}
            variant="outlined"
          />
        </Grid>

        {/* Triângulo */}
        <Paper elevation={3}>
          <Typography variant="h5" gutterBottom>
            Interacte com o Triângulo
          </Typography>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <svg
              ref={triangleRef}
              width={TRIANGLE_X_MAX + 50}
              height={TRIANGLE_Y_MAX + 50}
              onPointerDown={handlePointerDown}
              onPointerMove={isDragging ? handlePointerMove : undefined}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
              style={{ cursor: "pointer" }}
            >
              {/* Triângulo */}
              <polygon
                points={`${TRIANGLE_X_MIN},${TRIANGLE_Y_MAX} ${TRIANGLE_X_MAX},${TRIANGLE_Y_MAX} ${
                  (TRIANGLE_X_MIN + TRIANGLE_X_MAX) / 2
                },${TRIANGLE_Y_MIN}`}
                fill="white"
                stroke="#3B82F6"
                strokeWidth="2"
                strokeLinejoin="round"
              />
              {/* Labels */}
              <text
                x={(TRIANGLE_X_MIN + TRIANGLE_X_MAX) / 2}
                y={TRIANGLE_Y_MIN - 10}
                textAnchor="middle"
                className="font-bold text-blue-600"
              >
                Qualidade
              </text>
              <text
                x={TRIANGLE_X_MIN}
                y={TRIANGLE_Y_MAX + 15}
                textAnchor="middle"
                className="font-bold text-blue-600"
              >
                Custo
              </text>
              <text
                x={TRIANGLE_X_MAX}
                y={TRIANGLE_Y_MAX + 15}
                textAnchor="middle"
                className="font-bold text-blue-600"
              >
                Tempo
              </text>
              {/* Draggable point */}
              <circle
                cx={pointPosition.x}
                cy={pointPosition.y}
                r="6"
                fill="#3B82F6"
                stroke="white"
                strokeWidth="2"
                onPointerDown={handlePointerDown}
              />
            </svg>

            {/* Valores calculados */}
            <Grid container spacing={3} sx={{ mt: 2, maxWidth: "800px" }}>
              <Paper elevation={2} sx={{ p: 2, textAlign: "center" }}>
                <Typography variant="h6" color="primary" gutterBottom>
                  Qualidade
                </Typography>
                <Typography variant="h4" fontWeight="bold">
                  {Math.round(values.quality)}%
                </Typography>
              </Paper>
              <Paper elevation={2} sx={{ p: 2, textAlign: "center" }}>
                <Typography variant="h6" color="primary" gutterBottom>
                  Custo
                </Typography>
                <Typography variant="h4" fontWeight="bold">
                  R$ {values.cost.toFixed(2)}
                </Typography>
              </Paper>
              <Paper elevation={2} sx={{ p: 2, textAlign: "center" }}>
                <Typography variant="h6" color="primary" gutterBottom>
                  Tempo
                </Typography>
                <Typography variant="h4" fontWeight="bold">
                  {values.time} dias
                </Typography>
              </Paper>
            </Grid>
          </Box>
        </Paper>

        {/* Explicação */}
        <Paper elevation={3}>
          <Typography variant="h5" gutterBottom>
            Como Funciona o Triângulo
          </Typography>
          <Typography paragraph>
            O triângulo agora usa relações não-lineares para representar as
            restrições:
          </Typography>
          <Box component="ul" sx={{ pl: 3, mb: 2 }}>
            <Typography component="li">
              Curva logística para mapeamento suave entre posição e valor
            </Typography>
            <Typography component="li">
              Ajuste exponencial para capturar retornos decrescentes
            </Typography>
            <Typography component="li">
              Clipping explícito para evitar extrapolações
            </Typography>
            <Typography component="li">
              Constantes configuráveis para suportar diferentes tamanhos
            </Typography>
          </Box>
          <Typography>
            As relações não-lineares refletem melhor a realidade de projetos,
            onde pequenas mudanças nas extremidades têm impacto desproporcional.
          </Typography>
        </Paper>
      </Container>
    </Box>
  );
};

export default Home;