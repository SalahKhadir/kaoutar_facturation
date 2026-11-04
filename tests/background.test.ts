import {afterEach,expect,it,vi} from 'vitest';
import {loadBackground,backgroundError} from '../lib/invoice/background';
afterEach(()=>vi.unstubAllGlobals());
it('refuse un fichier manquant sans modèle alternatif', async()=>{
    vi.stubGlobal('fetch',vi.fn().mockResolvedValue({ok:false}));
    await expect(loadBackground()).rejects.toThrow(backgroundError);
});
it('refuse une réponse HTML servie à la place du PNG',async()=>{
    vi.stubGlobal('fetch',vi.fn().mockResolvedValue({ok:true,arrayBuffer:async()=>new TextEncoder().encode('<html>404</html>').buffer}));
    await expect(loadBackground()).rejects.toThrow(backgroundError);
});
