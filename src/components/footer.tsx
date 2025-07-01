import { Box, Link, Typography, Container } from "@mui/material";
import NextLink from "next/link";
import Image from "next/image";

export default function Footer() {
  return (
    <Box 
      component="footer" 
      sx={{ 
        mt: 4, 
        py: 4,
        bgcolor: 'background.default', // Usa a cor de fundo padrão do tema
        borderTop: 1, 
        borderColor: 'divider' // Linha superior sutil
      }}
    >
      <Container maxWidth="lg">
        {/* Conteúdo principal */}
        <Box
          sx={{
            textAlign: "center",
            p: 3,
            display: "flex",
            flexDirection: { xs: 'column', sm: 'row' }, // Responsivo
            alignItems: "center",
            justifyContent: "center",
            gap: 2, // Espaçamento entre elementos
          }}
        >
          <Typography 
            component="div"
            variant="body2"
            color="text.secondary"
            sx={{ 
              display: 'flex', 
              alignItems: 'center',
              flexWrap: 'wrap',
              justifyContent: 'center'
            }}
          >
            <span style={{ fontWeight: 500 }} property="dct:title">
              Project Management
            </span>
            {" is marked with "}
            <Link
              component={NextLink}
              href="https://creativecommons.org/publicdomain/zero/1.0/?ref=chooser-v1"
              target="_blank"
              rel="license noopener noreferrer"
              sx={{ 
                display: "flex", 
                alignItems: 'center',
                gap: 0.5,
                mx: 1,
                color: 'primary.main',
                textDecoration: 'none',
                '&:hover': {
                  opacity: 0.8,
                  transform: 'translateY(-2px)',
                  transition: 'all 0.2s ease-in-out'
                }
              }}
            >
              CC0 1.0 Universal
              <Box sx={{ 
                display: 'flex', 
                gap: 0.5,
                ml: 1
              }}>
                <Image
                  src="https://mirrors.creativecommons.org/presskit/icons/cc.svg?ref=chooser-v1"
                  alt="CC Icon"
                  width={24}
                  height={24}
                />
                <Image
                  src="https://mirrors.creativecommons.org/presskit/icons/zero.svg?ref=chooser-v1"
                  alt="Zero Icon"
                  width={24}
                  height={24}
                />
              </Box>
            </Link>
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}