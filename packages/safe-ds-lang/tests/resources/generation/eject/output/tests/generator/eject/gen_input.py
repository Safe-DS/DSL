# Pipelines --------------------------------------------------------------------

def test():
    f((g() or g()))
    f((g() and g()))
    f((lambda __gen_receiver, __gen_member_name: getattr(__gen_receiver, __gen_member_name) if __gen_receiver is not None else None)(factory(), 'a'))
    f((lambda __gen_receiver, __gen_member_name: getattr(__gen_receiver, __gen_member_name) if __gen_receiver is not None else None)(factory(), 'c'))
    f(((lambda __gen_a, __gen_b: __gen_a if __gen_a is not None else __gen_b)(i(), i())))
