import sys,os,time
import onnxruntime as ort
from rembg import remove,new_session
print(ort.get_available_providers())
in_dir,out_dir,model=sys.argv[1:4]
os.makedirs(out_dir,exist_ok=True)
s=new_session(model,providers=['DmlExecutionProvider','CPUExecutionProvider'])
print('active',s.inner_session.get_providers())
for f in sorted(os.listdir(in_dir)):
    if not f.endswith('.png'):continue
    t=time.time()
    d=remove(open(os.path.join(in_dir,f),'rb').read(),session=s)
    open(os.path.join(out_dir,f),'wb').write(d)
    print(f,round(time.time()-t,1),flush=True)
